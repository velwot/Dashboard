# ICT → AI Era Career Dashboard

A local-first career dashboard for a BE ICT student preparing for the AI era.

## Privacy architecture

This project deliberately separates public template data from private user data.

### Public layer
`data/public-template.json`

Safe to commit to a public GitHub repository. It contains the four-year roadmap, generic tasks, checklists and public resource links.

### Private layer
Browser `localStorage`, key:

`ictAiCareerDashboard.private.v2`

This contains the user's personal profile, task progress, projects, people, opportunities, proof, reviews and notes.

The app does not send this private data to a server.

### Important

Do NOT commit:
- exported private backups
- personal notes
- contact/people data
- application tracking
- private reviews
- API keys
- passwords/tokens

Use **Export private backup** for backups and keep that JSON outside the public repository.

## Deploy

This is a static app.

GitHub Pages:
1. Create a repository.
2. Copy the files in this folder into the repository.
3. Commit and push.
4. Enable GitHub Pages from repository settings.

Vercel / Netlify:
Deploy the same directory as a static site.

## GPT exchange

The app has two import paths:

- **Import private backup**: replaces/loads personal data.
- **Import public template**: updates the public roadmap/resources without touching private data.

The old single "Import GPT JSON" workflow should therefore be replaced by clearly labeled JSON outputs.

## Suggested future upgrades

- Optional encrypted cloud sync
- Authentication
- Cross-device sync
- Calendar integration
- Deadline reminders
- Opportunity scanner
- GPT-assisted weekly review
- Versioned private backups
