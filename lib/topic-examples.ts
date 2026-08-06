/**
 * Starter topics an organizer can load into the custom-topic form and edit.
 *
 * These are examples, not a second catalog — nothing reads them at render time.
 * The form copies one into its draft state and the organizer takes it from
 * there. They're written in the same voice as lib/tracks.ts: one concrete
 * build, one aha moment, a scope small enough to ship in 45 minutes.
 *
 * Each one leans on a different corner of Google's stack so a room that runs
 * several weeks in a row isn't building the same app with a new coat of paint.
 */
import type { GColor } from "./tracks";

export type TopicExample = {
  id: string;
  /** What the picker chip says. */
  label: string;
  /** One line under the chip explaining the angle. */
  blurb: string;
  title: string;
  tagline: string;
  emoji: string;
  color: GColor;
  mmv: string;
  thinkAbout: string[];
  tech: string[];
  polished: string[];
};

export const TOPIC_EXAMPLES: TopicExample[] = [
  {
    id: "neighborhood-time-machine",
    label: "Maps + Gemini",
    blurb: "Location data as a storytelling prompt.",
    title: "Neighborhood Time Machine",
    tagline: "Drop a pin on your street → hear what used to be there.",
    emoji: "🗺️",
    color: "green",
    mmv:
      "One map, one pin. The builder drops a marker with the Maps JavaScript API, and Gemini writes a short 'what this corner used to be' story for that spot — two paragraphs, warm, specific.\n\nNo timeline slider, no historical photo archive, no accounts. One pin, one story, on the page.",
    thinkAbout: [
      "Your prompt is the whole product. 'Write about this place' gets you a travel brochure; naming a decade and a voice gets you a story.",
      "Decide what happens over the ocean. Every map app has a nonsense-input case — pick your answer before someone in the room finds it.",
      "One pin at a time. Comparing two places is the polished version.",
    ],
    tech: ["Maps JavaScript API", "Gemini API", "Geocoding API"],
    polished: [
      "Decade slider — same corner, five eras",
      "Street View side-by-side",
      "Save a walking tour of pins",
      "Crowd-sourced corrections from locals",
    ],
  },
  {
    id: "receipt-whisperer",
    label: "Gemini vision + Sheets",
    blurb: "A photo in, structured data out.",
    title: "Receipt Whisperer",
    tagline: "Snap a receipt → a tidy row in your spreadsheet.",
    emoji: "🧾",
    color: "yellow",
    mmv:
      "Upload a photo of a receipt. Gemini reads it and returns structured JSON — merchant, date, total, category. One row appends to a Google Sheet.\n\nOne receipt at a time. No batch upload, no OCR fallback, no charts.",
    thinkAbout: [
      "Ask the model for JSON and give it the exact shape you want. 'Extract the details' returns prose you'll spend the session parsing.",
      "Crumpled receipts are the real test. Try a bad photo early — your prompt needs to handle it, not your users.",
      "Categories are a design decision. Five good ones beat thirty precise ones.",
    ],
    tech: ["Gemini API (vision)", "Google Sheets API", "Apps Script"],
    polished: [
      "Batch upload a shoebox of receipts",
      "Monthly summary with charts",
      "Split shared expenses between people",
      "Warn on a duplicate receipt",
    ],
  },
  {
    id: "poster-forge",
    label: "Imagen on Vertex AI",
    blurb: "Image generation with a real output format.",
    title: "Poster Forge",
    tagline: "Describe your event → a poster you can actually print.",
    emoji: "🎨",
    color: "red",
    mmv:
      "One text box: describe your event. Imagen on Vertex AI generates the artwork, and the page composites the title and date over it at a fixed poster size.\n\nOne poster, one layout. No template picker, no font controls, no editing after generation.",
    thinkAbout: [
      "Text rendered by an image model is unreliable. Generate the art, then draw the words over it in the browser — that's the trick that makes this look finished.",
      "Pick your poster size first. A4 and a social square are different apps once you start laying out text.",
      "Your fixed layout is the design. Choose one that flatters whatever comes back.",
    ],
    tech: ["Imagen on Vertex AI", "Canvas API", "Cloud Run"],
    polished: [
      "Several layout templates",
      "Brand colors pulled from a logo",
      "Print-ready PDF export",
      "Matching social-media crops",
    ],
  },
  {
    id: "room-read",
    label: "Firebase realtime",
    blurb: "Something the whole room uses at once.",
    title: "Room Read",
    tagline: "Everyone answers one question → the room's mood, live.",
    emoji: "📊",
    color: "blue",
    mmv:
      "A host page shows a question and a QR code. Everyone answers on their phone, and the results animate in live from Firestore. Gemini writes a one-sentence read on what the room is feeling.\n\nOne question. No login, no question editor, no history.",
    thinkAbout: [
      "Build the phone view first. That's where everyone actually is — the projector view is the easy half.",
      "Realtime means you can watch it work. Open two windows side by side while you build; it's the fastest feedback loop in the room.",
      "Decide what an empty room looks like. Everyone sees that screen first.",
    ],
    tech: ["Firestore realtime", "Firebase Hosting", "Gemini API"],
    polished: [
      "Host writes their own questions",
      "Multiple rounds with a saved history",
      "Word cloud from free-text answers",
      "Export the session as a summary",
    ],
  },
];
