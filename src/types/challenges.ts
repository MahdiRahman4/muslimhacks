export type ChallengeGroup = "pplus" | "sponsor";

export interface ChallengeOption {
  id: string;
  group: ChallengeGroup;
  number: string;
  title: string;
  tagline: string;
  themes: string[];
  problem: string;
  howToday: string;
  focus: string[];
  constraints: string[];
  beforeYouBuild: string[];
  deliverable: string;
  extra: string | null;
  example: string | null;
  requiresIpGrant: boolean;
  ipOwner: string | null;
  ipGrantText: string | null;
  team_count: number;
}

export interface ChallengesResponse {
  selected_challenge_id: string | null;
  challenges: ChallengeOption[];
}

export interface AdminChallengeSummary {
  id: string;
  group: ChallengeGroup;
  number: string;
  title: string;
  requires_ip_grant: boolean;
  team_count: number;
}

export interface AdminChallengePick {
  user_id: string;
  email: string;
  full_name: string | null;
  challenge_id: string;
  challenge_title: string;
  challenge_group: ChallengeGroup;
  signed_up_at: number;
  ip_acknowledged: boolean;
  ip_owner: string | null;
}

export interface AdminChallengesResponse {
  sections: { pplus: string; sponsor: string };
  challenges: AdminChallengeSummary[];
  picks: AdminChallengePick[];
  total_picks: number;
}
