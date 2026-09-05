# ICT → AI Era Career Dashboard — v3

## Architecture

This version keeps the **public template** and **private user state** separated.

### Public
`data/public-template.json`

Contains generic four-year goals, task templates, checklists and public resource links.

Safe to publish on GitHub.

### Private
Browser localStorage key:

`ictAiCareerDashboard.private.v3`

Contains:
- personal profile
- task completion state
- personal actions
- projects
- people/network
- opportunities
- proof-of-work
- weekly reviews
- private notes/settings

The app does not send this data to a server.

## v3 additions

- Installable PWA assets (`manifest.webmanifest`, `sw.js`)
- Offline caching when hosted over HTTPS
- Career-capital dashboard
- Year scores for directional progress
- Search/filter for actions
- Deadline view for personal opportunities
- Private project / network / opportunity / proof capture forms
- Weekly review with last-review tracking
- Public-link capture into private opportunities
- GPT sync prompt that exposes private data only when the user deliberately copies it
- Separate private backup import/export
- Explicit public/private security guidance

## Deploy

GitHub Pages, Vercel, or Netlify can serve this as a static site.

Put the entire folder into a repository and deploy it.

For PWA service workers, use HTTPS hosting (GitHub Pages, Vercel or Netlify), not `file://`.

## Security

Do not commit private backups, API keys, credentials or private contact data to the public repository.

localStorage is local-to-browser storage, not encryption. Anyone with access to the same browser profile/device may potentially inspect it.

## Next architectural milestone

Only after the local-first version proves useful should you add optional authenticated cloud sync.

Recommended future stack:
Frontend: static PWA
Auth: managed authentication
DB: row-level-secured database
Sync: per-user records
Secrets: server-side only
Optional: encrypted private fields before cloud storage
