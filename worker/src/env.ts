export interface Env {
  DB: D1Database;
  RESUMES?: R2Bucket;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  CLERK_SECRET_KEY: string;
}
