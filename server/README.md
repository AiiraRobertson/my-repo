# DistroMusic - Verification Server

This small Express server provides a simple verification flow for development and production.

Features
- POST /api/send-verification { email } — sends verification email via SendGrid (if configured) or SMTP/Ethereal for local testing
- GET /verify?token=... — validates token and redirects to `/recipe/dashboard.html?verified=1&email=...`

Setup
1. Copy `.env.example` to `.env` and fill values. At minimum set `EMAIL_SECRET`.
2. For production set `SENDGRID_API_KEY` and `FROM_EMAIL`.
3. For local testing you can leave SMTP empty and the server will use Ethereal (nodemailer) and return a preview URL.

Install & Run

  cd server
  npm install
  npm run dev   # requires nodemon

Testing
- Call POST /api/send-verification with `{ "email": "you@example.com" }`.
- If using ethereal, the response will include `preview` with a URL to preview the message.
- Clicking the email link will hit `/verify?token=...` which redirects to the dashboard page with query params expected by the frontend.

Server-side verification state
- Verification tokens and status are persisted in `server/data/users.json`.
- After sending a verification, the server stores `verificationToken`, `tokenExpires` and keeps `verified: false` until the link is used.
- The API `GET /api/user-status?email=you@example.com` returns `{ ok: true, email, verified, verifiedAt }` which the frontend polls to confirm verification.

Development helper endpoints
- `GET /api/users` (development only) returns the full users JSON so you can inspect verification tokens and state.

Notes
- The token is a JWT signed with `EMAIL_SECRET` and expires in 24 hours.
- The frontend already supports detection of `verified=1` or `token` query params and will mark the local user as verified when the server confirms it.

If you want, I can add a start script at the project root and a simple `Procfile` for deployment to Heroku-like hosts.