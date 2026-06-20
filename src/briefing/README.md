# Randall Briefing Form

Self-hosted fillable discovery briefing for Dr. Randall Jones' clinic website.
When Randall submits, the server builds a Markdown copy of his answers and emails
it (as a `.md` attachment) to the project inbox. Nothing is stored on the server.

## Stack
- Node 20 + Express (serves the static form and the `/submit` endpoint)
- Nodemailer over Gmail SMTP (sends the email)
- Plain HTML/CSS/JS front-end (no build step), schema-driven

## Structure
```
src/briefing/
├── server.js            # Express + validation + Markdown + email
├── package.json
├── Dockerfile           # for Coolify
├── .env.example         # copy to .env / set in Coolify
└── public/
    ├── index.html
    ├── schema.js        # form definition (mirrors server field IDs)
    ├── form.js          # render, autosave, validate, submit
    └── styles.css
```

## Local run
```bash
cd src/briefing
cp .env.example .env      # fill in SMTP_USER / SMTP_PASS
npm install
npm start                 # http://localhost:3000
```

## Gmail App Password (required)
The server sends mail through your Gmail account, which needs an **App Password**
(not your normal password):
1. Enable 2-Step Verification on the Google account.
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password, copy the 16-character code into `SMTP_PASS`.

## Deploy on Coolify
1. Push this repo to Git (GitHub/GitLab) — Coolify pulls from there.
2. In Coolify: **New Resource → Application → from Git**.
3. Set **Base Directory** to `src/briefing` and build pack to **Dockerfile**.
4. Add environment variables (from `.env.example`):
   `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM`.
5. Set the exposed port to **3000**, attach a domain, enable HTTPS.
6. Deploy. Visit the domain — the form loads. Submit a test to confirm the email arrives.

## Notes
- The form is `noindex` (not for search engines).
- Required-field validation runs on both client and server.
- Responses are emailed only; add disk/db persistence later if needed.
