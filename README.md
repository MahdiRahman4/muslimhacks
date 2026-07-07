### Environment variables

- **Frontend (Vite)**:
  - `VITE_API_URL` (local only): set to your local API server base URL (example: `http://localhost:5001`)
  - `VITE_RECAPTCHA_SITE_KEY`: your Google reCAPTCHA **v3 site key** (public)

- **Backend** (serverless `/api/subscribe.js` and/or `server/index.js`):
  - `RECAPTCHA_SECRET_KEY`: your Google reCAPTCHA **v3 secret key** (private)
  - Zoho keys: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_LIST_KEY`

### Allowed domains in Google reCAPTCHA

Google’s domain allowlist is **hostnames only** (no ports). For local dev, add:

- `localhost`
- `127.0.0.1` (optional)
