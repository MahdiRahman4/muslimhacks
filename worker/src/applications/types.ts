export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";

export interface ApplicationRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  school: string | null;
  program: string | null;
  graduation_year: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  resume_key: string | null;
  why_join: string | null;
  project_idea: string | null;
  dietary_restrictions: string | null;
  needs_travel_support: number;
  gender: string | null;
  accessibility: string | null;
  first_hackathon: number | null;
  cs_career: number | null;
  motivation: string | null;
  past_project: string | null;
  interests: string | null;
  community: string | null;
  status: ApplicationStatus;
  created_at: number;
  updated_at: number;
}

export interface ApplicationInput {
  full_name: string;
  phone: string | null;
  school: string | null;
  program: string | null;
  graduation_year: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  resume_key: string | null;
  why_join: string | null;
  project_idea: string | null;
  dietary_restrictions: string | null;
  needs_travel_support: boolean;
  gender: string | null;
  accessibility: string | null;
  first_hackathon: boolean | null;
  cs_career: boolean | null;
  motivation: string | null;
  past_project: string | null;
  interests: string | null;
  community: string | null;
}

export interface ApplicationResponse {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  school: string | null;
  program: string | null;
  graduation_year: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  resume_key: string | null;
  why_join: string | null;
  project_idea: string | null;
  dietary_restrictions: string | null;
  needs_travel_support: boolean;
  gender: string | null;
  accessibility: string | null;
  first_hackathon: boolean | null;
  cs_career: boolean | null;
  motivation: string | null;
  past_project: string | null;
  interests: string | null;
  community: string | null;
  status: ApplicationStatus;
  created_at: number;
  updated_at: number;
}
