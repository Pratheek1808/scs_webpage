# Deployment Guide — Shashi Consulting Services

The site is deployed on **Vercel** at https://www.shashiconsultingservices.in.

## How it's wired

- Static files (HTML/CSS/JS/images) are served directly by Vercel.
- `vercel.json` rewrites `/api/*` to `api/index.py`, which loads the Flask app
  from `app.py` as a serverless function (handles the contact form and chatbot).
- `cleanUrls: true` means pages are reachable without `.html`
  (e.g. `/payroll` serves `payroll.html`).

## Environment variables (set in the Vercel dashboard, never in git)

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Chatbot responses (`/api/chat`) |
| `SUPABASE_URL` | Contact form storage |
| `SUPABASE_KEY` | Contact form storage |

Project → Settings → Environment Variables. After changing one, redeploy.

## Deploying

Pushing to `main` on GitHub triggers an automatic Vercel deployment.
Preview deployments are created for pull requests.

## Local development

1. Create a `.env` file in this folder with the three variables above
   (`.env` is gitignored — keep it that way).
2. `pip install -r requirements.txt`
3. `python app.py` → http://localhost:5000

Note: locally, Flask serves the static files itself and only whitelisted
file types are served — `.env`, `.py`, `.csv` etc. return 404 by design.

## Contact form storage

Submissions go to the Supabase `contacts` table. On local runs they are
also appended to `messages.csv` (gitignored — contains personal data,
never commit it).
