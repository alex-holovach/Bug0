'use client';

import { SWRConfig } from 'swr';

const swrConfig = {
  // Global configuration for SWR
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  onError: (error: Error) => {
    console.error('SWR Error:', error);
  },
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
