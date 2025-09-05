import { fetchApi } from '@/lib/fetch-api';
import { View } from '@/lib/api/types/view';
import { ViewSnapshotStat } from '@/lib/api/types/view-snapshot';
import { ViewState } from '@/lib/api/types/view-state';
import { Organization } from '@/types/organization';
import { OrganizationUser } from '@/lib/api/types/user';
import { OrganizationInvitation } from '@/lib/api/types/invite';
import { SystemEvent } from '@/lib/api/types/event';
import { QuerySource } from '@/lib/api/types/query';
import { OrganizationStatus } from '@/types/organization-status';
import { GitHubOrganization, GitHubRepository } from '@/lib/api/types/github';

export const organizationsApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    return fetchApi<Organization[]>(`/api/organizations`, {
      method: 'GET',
    });
  },

  getOrganizationStatus: async (): Promise<OrganizationStatus> => {
    return fetchApi<OrganizationStatus>(`/api/organizations/status`, {
      method: 'GET',
    });
  },

  getOrganizationByID: async (
    organizationId: string
  ): Promise<Organization> => {
    return fetchApi<Organization>(`/api/organizations/${organizationId}`, {
      method: 'GET',
    });
  },

  createOrganization: async (request: {
    name: string;
  }): Promise<Organization> => {
    return fetchApi<Organization>(`/api/organizations`, {
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  getOrganizationUsers: async (): Promise<OrganizationUser[]> => {
    return fetchApi<OrganizationUser[]>(`/api/organizations/users`, {
      method: 'GET',
    });
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    return fetchApi(`/api/organizations/users/role`, {
      method: 'PUT',
      body: { userId, role },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  inviteUser: async (email: string, role: string): Promise<void> => {
    return fetchApi(`/api/organizations/users/invite`, {
      method: 'POST',
      body: { email, role },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  deleteUser: async (userId: string): Promise<void> => {
    return fetchApi(`/api/organizations/users`, {
      method: 'DELETE',
      body: { userId },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  getOrganizationInvites: async (): Promise<OrganizationInvitation[]> => {
    return fetchApi<OrganizationInvitation[]>(`/api/organizations/invites`, {
      method: 'GET',
    });
  },

  cancelInvite: async (inviteId: string): Promise<void> => {
    return fetchApi(`/api/organizations/invites`, {
      method: 'DELETE',
      body: { inviteId },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

export const viewsApi = {
  getViews: async (): Promise<View[]> => {
    return fetchApi<View[]>(`/api/views`, {
      method: 'GET',
    });
  },
  getViewByID: async (viewId: string): Promise<View> => {
    return fetchApi<View>(`/api/views/${viewId}`, {
      method: 'GET',
    });
  },
  updateView: async (view: View): Promise<View> => {
    return fetchApi<View>(`/api/views/${view.id}`, {
      method: 'PUT',
      body: view,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  deleteView: async (id: string | number): Promise<View> => {
    return fetchApi(`/api/views/${id}`, {
      method: 'DELETE',
    });
  },
  refreshView: async (id: string | number): Promise<View> => {
    return fetchApi(`/api/views/${id}/refresh`, {
      method: 'POST',
    });
  },
  createView: async (request: View): Promise<View> => {
    return fetchApi<View>(`/api/views`, {
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  getRecords: async (
    viewId: string | number,
    params: Record<string, string>
  ): Promise<ViewState> => {
    return fetchApi<ViewState>(`/api/views/records`, {
      method: 'POST',
      body: { viewId, arguments: params },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  getSnapshots: async (
    viewId: string | number
  ): Promise<ViewSnapshotStat[]> => {
    return fetchApi<ViewSnapshotStat[]>(`/api/views/${viewId}/snapshots`, {
      method: 'GET',
      cache: 'no-store',
    });
  },
  getSnapshot: async (
    viewId: string | number,
    snapshotId: number
  ): Promise<ViewState> => {
    return fetchApi<ViewState>(`/api/views/${viewId}/snapshots/${snapshotId}`, {
      method: 'GET',
      cache: 'no-store',
    });
  },
  getSnapshotByTimestamp: async (
    viewId: string | number,
    timestamp: Date
  ): Promise<ViewState> => {
    return fetchApi<ViewState>(
      `/api/views/${viewId}/snapshots/timestamp/${timestamp.toISOString()}`,
      {
        method: 'GET',
      }
    );
  },
  getEvents: async (): Promise<SystemEvent[]> => {
    return fetchApi<SystemEvent[]>(`/api/events`, {
      method: 'GET',
    });
  },
};

import {
  EndpointDetailsData,
  ServiceRequestMetricsData,
  ServiceDetailsData,
  QueryResponse,
} from '@/types/api-response';

export const recordsApi = {
  queryRecords: async (source: QuerySource): Promise<QueryResponse> => {
    return fetchApi<QueryResponse>(`/api/records/query`, {
      method: 'POST',
      body: source,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  fetchServiceDetails: async (
    serviceName: string,
    serviceQueryId: number
  ): Promise<ServiceDetailsData> => {
    const payload = {
      source: {
        type: 'query',
        queryId: serviceQueryId,
        condition: [
          {
            field: 'serviceName',
            operator: '=',
            value: serviceName,
          },
        ],
      },
    };

    return fetchApi<ServiceDetailsData>(`/api/records/query`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  fetchEndpointDetails: async (
    endpointKey: string,
    queryId: number
  ): Promise<EndpointDetailsData> => {
    const payload = {
      source: {
        type: 'query',
        queryId: queryId,
        join: [],
        condition: [
          {
            field: 'networkFlowKey',
            operator: '=',
            value: endpointKey,
          },
        ],
      },
    };

    return fetchApi<EndpointDetailsData>(`/api/records/query`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  fetchServiceRequestMetrics: async (
    serviceKey: string,
    integrationId: number,
    queryId: number
  ): Promise<ServiceRequestMetricsData> => {
    const payload = {
      source: {
        type: 'query',
        queryId: queryId,
        integrationId: integrationId,
        join: [],
        condition: [
          {
            field: 'serviceKey',
            operator: '=',
            value: serviceKey,
          },
        ],
      },
    };

    return fetchApi<ServiceRequestMetricsData>(`/api/records/query`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

export const clickhouseApi = {
  query: async (query: string): Promise<QueryResponse> => {
    const payload = {
      query,
    };

    return fetchApi<QueryResponse>(`/api/clickhouse/query`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
  },
};
