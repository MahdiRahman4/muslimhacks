export type Role = "applicant" | "volunteer" | "admin";

export const ROLES: Role[] = ["applicant", "volunteer", "admin"];

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
