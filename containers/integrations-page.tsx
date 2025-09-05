'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IntegrationsList } from '@/containers/integrations-list';
import { PageHeaderWithTitle } from '@/containers/page-header';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { getIntegrationIcon } from '@/components/integration/icon';
import { getGithubInstallationUrl } from '@/lib/github/utils';
import { getLinearInstallationUrl } from '@/lib/linear/utils';

export function IntegrationsPageContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  const githubInstallUrl = getGithubInstallationUrl('/integrations');
  const linearInstallUrl = getLinearInstallationUrl('/integrations');

  return (
    <>
      <PageHeaderWithTitle title="Integrations">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center">
          <div className="relative w-full sm:w-[240px] md:w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 justify-center">
                  <Plus className="h-4 w-4" />
                  Connect
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => (window.location.href = githubInstallUrl)}>
                  {getIntegrationIcon('github', 'h-4 w-4')}
                  Connect GitHub
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => (window.location.href = linearInstallUrl)}>
                  {getIntegrationIcon('linear', 'h-4 w-4')}
                  Connect Linear
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </PageHeaderWithTitle>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <IntegrationsList searchQuery={searchQuery} />
      </div>
    </>
  );
}
