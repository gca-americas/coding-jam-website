import { NextResponse } from "next/server";
import { Runner, InMemorySessionService } from "@google/adk";
import { auth } from "@/auth";
import { canManageJams, getOrganizer } from "@/lib/organizers";
import { buildJamAgent } from "@/lib/agent/agent";
import { getLocale } from "@/lib/i18n";
import type { ToolSignal } from "@/lib/agent/tools";

/**
 * The jam assistant's only entry point — and the only place identity is
 * established. The agent runs in this process, so the tools it calls are
 * ordinary functions invoked inside a request that has already passed
 * canManageJams(). There is no second service to authenticate to.
 *
 * The browser sends the whole transcript each turn and the session is rebuilt
 * here. Cloud Run has no session affinity, so an in-memory session that lived
 * across turns would break the moment a second instance spun up.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_NAME = "jam_setup_assistant";
const MAX_TURNS = 40;
/** Events one reply may stream before we cut it off. Backstop to the tool budget. */
const MAX_EVENTS = 40;

type Turn = { role: "user" | "model"; text: string };

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!(await canManageJams(email))) {
    return NextResponse.json({ error: "Organizer access needed." }, { status: 403 });
  }

  let body: { turns?: Turn[]; collected?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const turns = (body.turns ?? []).slice(-MAX_TURNS).filter((t) => t?.text?.trim());
  const collected = body.collected ?? {};
  if (turns.length === 0 || turns[turns.length - 1].role !== "user") {
    return NextResponse.json({ error: "Expected a trailing user turn." }, { status: 400 });
  }

  const record = await getOrganizer(email).catch(() => null);
  const organizer = {
    email,
    displayName: record?.displayName || session?.user?.name || "there",
    chapter: record?.chapter,
    chapterType: record?.chapterType,
    isGde: record?.isGde,
    country: record?.country,
  };

  // Tools push UI signals here; they are drained after the run and sent on.
  const signals: ToolSignal[] = [];
  const locale = await getLocale();
  const agent = buildJamAgent(organizer, signals, locale);
  const sessionService = new InMemorySessionService();
  const runner = new Runner({ appName: APP_NAME, agent, sessionService });

  // Must match the runner's own appName or runAsync cannot find the session.
  const adkSession = await sessionService.createSession({
    appName: runner.appName,
    userId: organizer.email,
  });

  // Replay everything but the newest message as history, then send that one.
  const history = turns.slice(0, -1);
  const latest = turns[turns.length - 1];

  const encoder = new TextEncoder();
  // The browser can navigate away mid-reply, which closes the stream under us.
  // Enqueueing after that throws "Controller is already closed", so every write
  // goes through this guard and the run stops at the next event.
  let closed = false;
  const stream = new ReadableStream({
    cancel() {
      closed = true;
    },
    async start(controller) {
      const send = (event: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          closed = true;
        }
      };
      try {
        let seen = 0;
        for await (const event of runner.runAsync({
          userId: organizer.email,
          sessionId: adkSession.id,
          newMessage: {
            role: "user",
            parts: [
              ...history.map((t) => ({ text: `[${t.role === "user" ? "Organizer" : "You"}]: ${t.text}` })),
              // Settled values, stated plainly. Without this the agent works them
              // out from the transcript and asks again for things already picked.
              ...(Object.keys(collected).length
                ? [
                    {
                      text:
                        "[Already settled — do not ask about these again]\n" +
                        Object.entries(collected)
                          .map(([field, value]) => `  ${field}: ${value}`)
                          .join("\n"),
                    },
                  ]
                : []),
              { text: latest.text },
            ],
          },
        })) {
          if (event?.errorMessage) {
            console.error("[agent] runner error:", event.errorCode, event.errorMessage);
            send({ type: "error", message: event.errorMessage });
            break;
          }
          const parts = event?.content?.parts ?? [];
          for (const part of parts) {
            if (typeof part?.text === "string" && part.text.trim()) {
              send({ type: "text", text: part.text });
            }
          }
          while (signals.length) send({ type: "signal", signal: signals.shift() });
          if (closed) break;
          if (++seen >= MAX_EVENTS) {
            console.warn("[agent] event ceiling hit — ending the reply early");
            send({ type: "error", message: "That took too many steps. Tell me where you got to and we'll carry on." });
            break;
          }
        }
        send({ type: "done" });
      } catch (err) {
        console.error("[agent] run failed", err);
        send({ type: "error", message: "The assistant hit a problem. Try again." });
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            /* already gone */
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
