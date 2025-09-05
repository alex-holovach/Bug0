'use client';

import { useMemo } from 'react';
import { IntegrationCardWrapper } from '@/components/integration/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntegrations } from '@/hooks/use-integrations';

interface IntegrationsListProps {
  searchQuery?: string;
}

export function IntegrationsList({ searchQuery = '' }: IntegrationsListProps) {
  const { data: integrations, isLoading } = useIntegrations();
  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) {
      return integrations;
    }

    const query = searchQuery.toLowerCase();
    return integrations?.filter(
      integration =>
        integration.name.toLowerCase().includes(query) ||
        integration.type.toLowerCase().includes(query)
    );
  }, [searchQuery, integrations]);

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="p-6 border rounded-lg">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredIntegrations && filteredIntegrations.length > 0 ? (
        filteredIntegrations.map((integration, index) => (
          <IntegrationCardWrapper key={index} integration={integration} />
        ))
      ) : (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No integrations found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
