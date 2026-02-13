

## Fix: Email Subscription on Vercel Deployment

### The Problem
Both `OpeningSection.tsx` and `InvitationSection.tsx` have the API URL hardcoded to `http://localhost:5001/api/subscribe`. This works locally but fails on Vercel because there's no Express server running there.

### The Solution (2 parts)

---

### Part 1: Convert `api/subscribe.js` to a Vercel Serverless Function

The existing `api/subscribe.js` is written as a full Express server. Vercel serverless functions use a simpler format: they export a single handler function that receives `(req, res)`.

**Changes to `api/subscribe.js`:**
- Remove Express app setup, CORS middleware, and `app.listen()`
- Export a default handler function `(req, res)`
- Add manual CORS headers
- Keep the Zoho logic as-is (it reads env vars which you've already set in Vercel)

---

### Part 2: Update Frontend API URLs

**Files:** `src/components/sections/OpeningSection.tsx` and `src/components/sections/InvitationSection.tsx`

Change:
```
fetch('http://localhost:5001/api/subscribe', ...)
```
To:
```
fetch('/api/subscribe', ...)
```

Using a relative URL means it automatically works both locally (with Vercel CLI) and in production.

---

### Summary of File Changes

| File | Change |
|------|--------|
| `api/subscribe.js` | Rewrite as Vercel serverless function (export default handler) |
| `src/components/sections/OpeningSection.tsx` | Change API URL to `/api/subscribe` |
| `src/components/sections/InvitationSection.tsx` | Change API URL to `/api/subscribe` |

### After Deploying
The Vercel env variables you already set (ZOHO_CLIENT_ID, etc.) will be automatically available to the serverless function via `process.env`. No additional configuration needed.

