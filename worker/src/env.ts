export interface Env {
  DB: D1Database;
  RESUMES?: R2Bucket;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  CLERK_SECRET_KEY: string;
  /** Resend API key — set in .dev.vars / wrangler secret */
  RESEND_API_KEY?: string;
  /** Sender address on a verified domain (e.g. outreach@muslimhacksoutreach.ca) */
  EMAIL_FROM?: string;
  /** Where replies go (can still be info@muslimhacks.ca) */
  EMAIL_REPLY_TO?: string;
}
