export interface GithubInstallationPR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  locked: boolean;
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merged_by: any | null;
  merge_commit_sha: string | null;
  assignees: any[];
  requested_reviewers: any[];
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  milestone: {
    id: number;
    number: number;
    title: string;
    description: string | null;
    state: string;
    due_on: string | null;
  } | null;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: any;
    repo: {
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      html_url: string;
    };
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: any;
    repo: {
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      html_url: string;
    };
  };
  user: any;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  additions: number;
  deletions: number;
  changed_files: number;
  comments: number;
  review_comments: number;
  commits: number;
  maintainer_can_modify: boolean;
  author_association: string;
  auto_merge: {
    enabled_by: any;
    merge_method: string;
    commit_title: string;
    commit_message: string;
  } | null;
  active_lock_reason: string | null;
}
