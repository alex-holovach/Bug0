import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Bug0`,
    description: 'Bug0 | QA Agent',
  };
}

export default function Page() {
  redirect('/projects');
}
