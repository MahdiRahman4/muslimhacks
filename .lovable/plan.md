

## Fix: Convert `api/subscribe.js` to ES Module Syntax

### The Problem
Vercel's runtime sees `"type": "module"` in `package.json` and expects ES module syntax (`import`/`export`), but `api/subscribe.js` uses CommonJS (`require`/`module.exports`).

### The Fix
Update `api/subscribe.js` to use ES module syntax:

- Change `const axios = require('axios')` to `import axios from 'axios'`
- Change `module.exports = async function handler(...)` to `export default async function handler(...)`

That's it -- no other changes needed. After redeploying on Vercel, the serverless function should work.

### Technical Details

| Line | Before | After |
|------|--------|-------|
| 1 | `const axios = require('axios');` | `import axios from 'axios';` |
| Last | `module.exports = async function handler(req, res) {` | `export default async function handler(req, res) {` |

### File Changed
- `api/subscribe.js`

