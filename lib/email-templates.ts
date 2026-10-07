/**
 * Email drafts organizers send: one to Google asking for Google Cloud credits, one
 * to their room before the doors open.
 *
 * Kept here rather than inline in a page so the /organizer copy and the copy on
 * every jam page can't drift apart. Square brackets mark the bits an organizer
 * must fill in — the dialog tells them to look for those before sending.
 */

/** Where GDG organizers in the Americas request Google Cloud credits. */
export const CREDITS_CONTACT = "na-developer-communities@google.com";

/** Where someone asks to be added to the organizer roster. */
export const ORGANIZER_SIGNUP_CONTACT = "gca-americas@google.com";

export type ParticipantEmailInput = {
  jamTitle: string;
  topicTitle: string;
  topicTagline: string;
  chapter: string;
  eventDate?: string;
  locationNote?: string;
  rsvpUrl?: string;
  organizerName?: string;
  /** Absolute or root-relative; the guides live under /tools. */
  origin?: string;
};

export function creditsRequestSubject(chapter: string, eventDate?: string): string {
  const when = eventDate ? ` — ${eventDate}` : "";
  return `Requesting Google Cloud credits for a GDG Coding Jam · ${chapter}${when}`;
}

export function creditsRequestBody({
  chapter,
  eventDate,
  organizerName,
}: {
  chapter: string;
  eventDate?: string;
  organizerName?: string;
}): string {
  return `Hi Developer Communities team,

I'm organizing a GDG Coding Jam and would like to request Google Cloud credits for it.

  Chapter:            ${chapter}
  Date:               ${eventDate ?? "[date]"}
  Format:             2-hour in-person Coding Jam
  Expected headcount: [number]
  GCP project ID:     [your-project-id]
  Billing account:    [billing account ID, if you have one]
  Event page:         [link to your event or RSVP page]

Thanks,
${organizerName ?? "[your name]"}
${chapter}`;
}

export function participantEmailSubject(jamTitle: string, eventDate?: string): string {
  return eventDate ? `${jamTitle} — ${eventDate}, here's how to prepare` : `${jamTitle} — how to prepare`;
}

export function participantEmailBody({
  jamTitle,
  topicTitle,
  topicTagline,
  chapter,
  eventDate,
  locationNote,
  rsvpUrl,
  organizerName,
  origin = "",
}: ParticipantEmailInput): string {
  const when = [eventDate, locationNote].filter(Boolean).join(" · ") || "[date and time]";
  const rsvpLine = rsvpUrl ? `\n  RSVP:     ${rsvpUrl}` : "";

  return `Hi everyone,

You're booked in for ${jamTitle}. Here's everything you need before you arrive.

WHAT WE'RE BUILDING
  ${topicTitle} — ${topicTagline}

  You'll go from nothing to a working app in about an hour, with AI doing the
  typing. No prior experience with the topic needed.

THE DETAILS
  When:     ${when}
  Where:    [address / room]${rsvpLine}

BEFORE YOU ARRIVE — please do this at home, on decent wifi
  Pick one of two tools. They suit different people and both ship a real app:

  1) Google AI Studio — nothing to install, runs in your browser.
     Best if you don't write code day to day, or you'd rather not install an
     IDE. Sign in with your Google account and you're ready — no key, no
     project, nothing to claim.
     Setup: ${origin}/tools/ai-studio

  2) Antigravity — an AI-driven desktop IDE on your own machine.
     Best if you already have an editor, a terminal and Git set up.
     You'll need Antigravity, Git + a GitHub account, and a Google Cloud
     project. This is the path the Google Cloud credits apply to — I'll share the
     claim link on the day.
     Setup: ${origin}/tools/antigravity

  Not sure which? There's a 30-second picker on ${origin || "the site"} that asks
  four questions and tells you.

  Whichever you choose, please install and sign in BEFORE the session. We only
  have two hours and setup is the one thing that eats them.

ON THE DAY
  Bring a laptop and a charger. Drop-ins without the setup are still welcome —
  find me and I'll pair you with someone.

See you there,
${organizerName ?? "[your name]"}
${chapter}`;
}


export function organizerSignupSubject(chapter?: string): string {
  return chapter
    ? `Requesting organizer access for GDG Coding Jams · ${chapter}`
    : "Requesting organizer access for GDG Coding Jams";
}

/**
 * The "add me to the roster" request.
 *
 * The roster is keyed on a Google account, so the address this is sent from is
 * the thing being registered — that is why the signed-in identity is written
 * into the body rather than left as a bracket to fill in. Someone who is not
 * signed in gets brackets and a line telling them which address to use, since
 * sending from the wrong one is the mistake that costs a round trip.
 */
export function organizerSignupBody({
  name,
  email,
}: {
  name?: string;
  email?: string;
}): string {
  const identity = email
    ? `  Google account:  ${email}
  Name:            ${name ?? "[your name]"}`
    : `  Google account:  [the Gmail or Workspace address you will sign in with]
  Name:            [your name]`;

  return `Hi Google Community Ambassadors team,

I'd like to run GDG Coding Jams and would like organizer access on codingjam.dev.

${identity}

  I am a:          [GDG chapter organizer / GDG on Campus organizer / Google Developer Expert]
  Chapter:         [your chapter, e.g. GDG Seattle — leave blank if you are a GDE]
  GDE profile:     [link to your GDE directory profile, if you are a GDE]
  Country:         [country]
  First jam:       [rough date, or "not decided yet"]

Once I'm on the roster I'll be able to publish a jam page and take
submissions from my room.

Thanks,
[your name]`;
}
