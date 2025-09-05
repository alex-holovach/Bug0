import { OrganizationUser } from '@/lib/api/types/user';

export interface UsageData {
  logsCount: number;
  tracesCount: number;
  totalEvents: number;
}

export interface UserUsageData {
  users: OrganizationUser[];
  userCount: number;
}

export interface BillingApiResponse<T> {
  data: T | null;
  error: string | null;
}
