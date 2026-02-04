'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface IssueSidebarProps {
  issueKey: string;
  issueSummary?: string;
  jiraUrl?: string;
}

export function IssueSidebar({
  issueKey,
  issueSummary,
  jiraUrl,
}: IssueSidebarProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Issue</CardTitle>
          {jiraUrl && (
            <a
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View in Jira
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Issue key */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Issue</p>
          <p className="text-2xl font-bold font-mono">{issueKey}</p>
        </div>

        {/* Summary/Title */}
        {issueSummary && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Summary</p>
            <p className="font-medium">{issueSummary}</p>
          </div>
        )}

        {/* Phase 1: Manual entry notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Full Jira integration coming in Phase 2. Currently using manual
            issue entry.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
