import { Metadata } from 'next';
import CreateArtifactForm from '@/components/blocks/forms/create-block-form';
import Breadcrumbs from '@/components/ui/components/breadcrumbs';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Create Artifact',
};

export default function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Artifacts', href: '/dashboard/blocks' },
          {
            label: 'Create Artifact',
            href: '/dashboard/blocks/create',
            active: true,
          },
        ]}
      />
      <Suspense fallback={<div>Loading form...</div>}>
        <CreateArtifactForm />
      </Suspense>
    </main>
  );
}