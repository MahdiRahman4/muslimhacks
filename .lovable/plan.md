

## Fix: Add Vercel Configuration for Serverless Function Routing

### The Problem
Vercel is returning a 404 for `/api/subscribe` because it doesn't know how to route API requests to your serverless function. Without a `vercel.json`, Vercel serves only the Vite build output and doesn't recognize `api/subscribe.js` as a serverless function endpoint.

### The Solution
Create a `vercel.json` at the project root that:
1. Tells Vercel to route `/api/*` requests to the serverless functions in the `api/` directory
2. Tells Vercel to serve all other routes from the Vite build output (for your SPA)

### File to Create

**`vercel.json`** (new file at project root):

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel:
- Requests to `/api/subscribe` go to the serverless function `api/subscribe.js`
- All other requests serve `index.html` (so your React Router works correctly)

### No Other Changes Needed
- `api/subscribe.js` already has correct ESM syntax
- Frontend already uses relative `/api/subscribe` URL
- Zoho env vars are already set in Vercel

### After This
Commit, push, and redeploy on Vercel. The 404 should be resolved and email subscription should work.

