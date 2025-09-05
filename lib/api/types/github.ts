export interface GitHubOrganization {
  id: number;
  login: string;
  name: string;
  description: string;
  url: string;
  avatar_url: string;
}

export interface GitHubRepository {
  updated_at: string;
  id: number;
  name: string;
  full_name: string;
  description: string;
  url: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  private: boolean;
  fork: boolean;
  // The integration id this repository belongs to (our internal integration record id)
  integrationId: string;
}
