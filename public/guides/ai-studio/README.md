# AI Studio walkthrough captures

Drop the screen captures for `/tools/ai-studio` here. The page renders a
labelled placeholder for any missing file and swaps it for the real image as
soon as the file exists — no code change needed.

| Step | File              | Type | What it should show                           |
|------|-------------------|------|-----------------------------------------------|
| 2    | `01-new-app.png`  | PNG  | The **+ App** button in the AI Studio sidebar |

Notes:
- The filename must match exactly — it's referenced in `app/tools/ai-studio/page.tsx`.
- **Any size is fine.** The page reads the file's real dimensions at build time,
  so a replacement at a different resolution or aspect just works — nothing to
  update in code.
- Crop or blur anything personal in the sidebar before committing.
- Full-width screenshots read best at around 1200–1600px wide.
