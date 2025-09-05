import { Metadata } from 'next';
import { IntegrationsPageContainer } from '@/containers/integrations-page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Integrations | Kubiks`,
    description: 'Manage your integrations and connections',
  };
}

export default function IntegrationsPage() {
  return <IntegrationsPageContainer />;
}
