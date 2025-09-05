export type GithubInstallation = {
  redirectUrl: string;
};

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GitHubUserResponse {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubInstallationResponse {
  id: number;
  account: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  repository_selection: string;
  permissions: Record<string, string>;
  events: string[];
  created_at: string;
  updated_at: string;
  single_file_name?: string;
  html_url: string;
  app_id: number;
  app_slug: string;
}
