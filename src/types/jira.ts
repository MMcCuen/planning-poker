// Phase 2: Jira integration types

export interface JiraIssue {
  id: string;
  key: string; // e.g., "PROJ-123"
  summary: string; // Issue title
  description?: string;
  issueType: string; // Story, Bug, Task, etc.
  status: string;
  priority?: string;
  assignee?: {
    accountId: string;
    displayName: string;
    avatarUrls: Record<string, string>;
  };
  storyPoints?: number; // Current estimate
  customFields?: Record<string, unknown>; // Additional fields
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: 'scrum' | 'kanban';
}
