export type Role = "applicant" | "volunteer" | "admin";

export const ROLES: Role[] = ["applicant", "volunteer", "admin"];

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  /** From Clerk first+last name when available */
  full_name: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
