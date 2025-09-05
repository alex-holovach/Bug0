export interface VercelInstall {
  vercelInstallationId: string;
  vercelUserId: string;
  vercelTeamId?: string;
  vercelAccessToken: string;
  configurationId?: string;
  status: 'pending_auth' | 'linked' | 'expired';
  userId?: string;
  userEmail?: string;
}

export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: string;
}

export interface VercelProject {
  id: string;
  name: string;
  description?: string;
  link?: {
    type: 'github' | 'gitlab' | 'bitbucket';
    repo: string;
    repoId: number;
    org?: string;
    gitCredentialId?: string;
  };
  framework?: string;
  devCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
  publicSource?: boolean;
  createdAt: number;
  updatedAt: number;
  env: Array<{
    key: string;
    value: string;
    type: 'encrypted' | 'plain' | 'system';
    configurationId?: string;
    updatedAt?: number;
    createdAt?: number;
  }>;
  targets?: {
    production: {
      id: string;
      domain: string;
    };
  };
}

export interface TeamWithProjects extends VercelTeam {
  projects: VercelProject[];
}
