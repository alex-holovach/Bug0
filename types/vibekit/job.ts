export interface VibeKitJobData {
  githubToken: string;
  githubRepository: string;
  prompt: string;
  mode: 'code' | 'ask';
}
