export interface Env {
  DB: D1Database;
  RESUMES?: R2Bucket;
  /** Cloudflare Email Sending binding — optional until domain is onboarded */
  EMAIL?: SendEmail;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  CLERK_SECRET_KEY: string;
  /** Sender address — domain must be onboarded for Email Sending */
  EMAIL_FROM?: string;
}
