import {
  getOrganizationUsers,
  getOrganizationInvites,
} from '@/actions/organization';
import { OrganizationSettings } from '@/containers/organization/organization-settings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organization Settings | Kubiks',
  description: 'Manage your organization settings',
};

export default async function Page() {
  const users = await getOrganizationUsers();
  const invites = await getOrganizationInvites();

  return <OrganizationSettings users={users} invites={invites} />;
}
