# ICT → AI Era Career Dashboard v4

## Verdict on v4

The useful upgrade is an **opportunity engine**, not a fake scraper.

This version is still static/local-first:
- public template + discovery-source catalogue are safe to publish
- personal opportunity/application tracking stays in browser localStorage
- no third-party credentials are stored
- no server is required

## Opportunity engine

Workflow:

`Discover → Shortlist → Preparing → Applied → Assessment → Interview → Outcome`

Each opportunity can track:
- title
- type
- company/organization
- relevant year
- deadline
- follow-up date
- stage
- status
- fit score
- proof value
- learning value
- contact
- application URL
- source URL
- notes / requirements / next action

The app calculates a directional opportunity score and urgency label.

## Deadline engine

- overdue detection
- 3/7/14 day urgency bands
- follow-up queue
- calendar `.ics` export
- optional browser alert when the app is opened

Important limitation: a static browser app cannot reliably run scheduled background scraping across arbitrary third-party sites. v4 therefore uses **source discovery + human verification + private tracking**. A later backend can add scheduled ingestion.

## GPT workflow

The GPT sync dialog generates a prompt with the current private state.

Recommended workflow:
1. Copy GPT prompt.
2. Ask GPT for current opportunities or an improved action plan.
3. Ask it to return ONLY `private-backup` JSON.
4. Save the JSON as a file.
5. Import/merge it.
6. v4 makes an automatic pre-import backup.

The import is merge-based by ID rather than blind replacement.

## Public sources currently seeded

Discovery sources include Devpost, Major League Hacking, Kaggle, CTFtime, Google Summer of Code, Google Developer Community, IEEE student branches, Microsoft student careers/Explore, Apple student internships, IBM internships, Amazon University SDE, LinkedIn student/intern discovery, arXiv and Papers with Code.

These are discovery sources, not guarantees of eligibility or availability. Verify the actual opportunity before applying.

## Deployment

GitHub Pages, Vercel or Netlify can host the static site.

For PWA/offline support, deploy over HTTPS.

### GitHub

Copy this folder into a repository and enable Pages.

Do not commit exported private backup JSON.

## Privacy

Private data is stored under localStorage key:

`ictAiCareerDashboard.private.v4`

localStorage is not encryption. Anyone with access to the same browser profile/device may potentially inspect it.

## Next logical milestone

Only after using v4 enough to prove that opportunity tracking is actually valuable should you add:

- authenticated cross-device sync
- a server-side scheduled scanner
- RSS/API connectors
- per-user opportunity matching
- server-side notification delivery

Do not add those prematurely.
