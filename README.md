# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Email pre-registration + reCAPTCHA (local + production)

This site uses a “Notify me” email pre-registration flow that calls `POST /api/subscribe`.

- **Frontend**: shows a confirmation modal and a reCAPTCHA widget.
- **Backend**: verifies the reCAPTCHA token server-side, then subscribes the email via Zoho Campaigns.

### Environment variables

- **Frontend (Vite)**:
  - `VITE_API_URL` (local only): set to your local API server base URL (example: `http://localhost:5001`)
  - `VITE_RECAPTCHA_SITE_KEY`: your Google reCAPTCHA **site key** (public)

- **Backend** (serverless `/api/subscribe.js` and/or `server/index.js`):
  - `RECAPTCHA_SECRET_KEY`: your Google reCAPTCHA **secret key** (private)
  - Zoho keys: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_LIST_KEY`

### Allowed domains in Google reCAPTCHA

Google’s domain allowlist is **hostnames only** (no ports). For local dev, add:

- `localhost`
- `127.0.0.1` (optional)

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
