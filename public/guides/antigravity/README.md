# Antigravity walkthrough captures

Screen captures for `/tools/antigravity`. The page renders a labelled
placeholder for any file that's missing and swaps it for the real capture as
soon as the file exists.

| Step | File                            | Type | What it shows                                                     |
|------|---------------------------------|------|-------------------------------------------------------------------|
| 1    | `01-claim-credits.gif`          | GIF  | Claiming credits + the "Join the Google Developer Program" prompt |
| 2    | `02-create-project-billing.gif` | GIF  | Creating the project, then attaching the billing account          |
| 3    | `03-enable-agent-platform.gif`  | GIF  | Hitting **Enable** at the top of Agent Platform overview          |
| 4    | `04-copy-project-id.gif`        | GIF  | Copying the project ID out of the Cloud Console                   |
| 5    | `05-antigravity-use-gcp.gif`    | GIF  | Choosing "Google Cloud project" instead of signing in             |
| 6    | `06-paste-project-id.gif`       | GIF  | Pasting the project ID into Antigravity                           |

Notes:
- Filenames must match exactly — they're referenced in `app/tools/antigravity/page.tsx`.
- **Any size is fine.** The page reads each file's real dimensions at build time,
  so a replacement at a different resolution or aspect just works — nothing to
  update in code.
- **Record at a decent resolution.** These are dense console UI, and people read
  them to match against their own screen. The current set is 544×306, which is
  too small to read once it's on the page — aim for 1400–1600px wide. Capturing
  a browser window at 1280–1400 wide on a retina display gets you there.
- Blur or crop out real project IDs, billing account numbers and email addresses.
- Keep GIFs as small as you can bear — they're the heaviest thing on the site,
  which is why the page only loads them as you scroll to them. Trimming dead
  frames at the start and end usually saves more than lowering quality does.
