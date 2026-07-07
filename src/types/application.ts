export type UserRole = "applicant" | "volunteer" | "admin";

export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Application {
  id: string;
  user_id: string;
  email?: string;
  full_name: string;
  phone: string | null;
  school: string | null;
  program: string | null;
  graduation_year: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  why_join: string | null;
  project_idea: string | null;
  dietary_restrictions: string | null;
  needs_travel_support: boolean;
  gender: string | null;
  status: ApplicationStatus;
  reviewed_by?: string | null;
  reviewed_at?: number | null;
  created_at: number;
  updated_at: number;
}

export interface ApplicationReview {
  id: string;
  application_id: string;
  reviewed_by: string;
  reviewer_email: string | null;
  score: number | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: number;
}

export interface ApplicationFormValues {
  full_name: string;
  phone: string;
  school: string;
  program: string;
  graduation_year: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  resume_url: string;
  why_join: string;
  project_idea: string;
  dietary_restrictions: string;
  needs_travel_support: boolean;
  gender: string;
}

export interface AdminApplicationSummary {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  school: string | null;
  program: string | null;
  graduation_year: number | null;
  gender: string | null;
  status: ApplicationStatus;
  needs_travel_support: boolean;
  reviewed_by: string | null;
  reviewed_at: number | null;
  created_at: number;
  updated_at: number;
}
