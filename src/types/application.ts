export type UserRole = "applicant" | "volunteer" | "admin";

/** Internal DB / admin statuses */
export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";

/** Student dashboard statuses from GET /api/users/me/summary: raw status + not_started default */
export type DashboardApplicationStatus = "not_started" | ApplicationStatus;

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string | null;
}

export interface UserSummary {
  full_name: string | null;
  has_application: boolean;
  /** Always set — defaults to not_started when user has no application */
  application_status: DashboardApplicationStatus;
  submitted_at: number | null;
}

export interface UserSummaryResponse {
  user: AuthUser;
  summary: UserSummary;
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
  resume_key: string | null;
  why_join: string | null;
  project_idea: string | null;
  dietary_restrictions: string | null;
  needs_travel_support: boolean;
  gender: string | null;
  accessibility: string | null;
  first_hackathon: boolean | null;
  hackathon_count: number | null;
  cs_career: boolean | null;
  motivation: string | null;
  past_project: string | null;
  interests: string | null;
  community: string | null;
  status: ApplicationStatus;
  confirmation_email_sent_at?: number | null;
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

export interface ApplicationParticipant {
  id: string;
  public_checkin_code: string;
  checkin_status: string;
}

export interface MyParticipant {
  checkin_code: string;
  checkin_status: "not_checked_in" | "checked_in";
  checked_in_at: number | null;
}

export interface MyParticipantResponse {
  participant: MyParticipant | null;
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

export interface ApplicationForm {
  fullName: string;
  phone: string;
  gender: string;
  institution: string;
  github: string;
  linkedin: string;
  resumeFile: File | null;
  dietary: string;
  accessibility: string;
  firstHackathon: boolean | null;
  hackathonCount: number | null;
  csCareer: boolean | null;
  motivation: string;
  pastProject: string;
  interests: string;
  community: string;
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
  first_hackathon: boolean | null;
  hackathon_count?: number | null;
  cs_career: boolean | null;
  reviewed_by: string | null;
  reviewed_at: number | null;
  created_at: number;
  updated_at: number;
}
