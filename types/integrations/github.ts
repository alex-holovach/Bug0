export interface GithubMetadata {
  installationId: string;
  installationAccount: {
    login: string;
    type: string;
    avatarUrl: string;
    htmlUrl: string;
  };
}
