import Form from '@/components/ui/projects/edit-form';
import Breadcrumbs from '@/components/ui/projects/breadcrumbs';
import { fetchProject, fetchArtifacts } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit',
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [project, artifacts] = await Promise.all([
    fetchProject(id),
    fetchArtifacts(),
  ]);

  if (!project) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          {
            label: 'Edit Project',
            href: `/dashboard/projects/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form project={project} artifacts={artifacts} />
    </main>
  );
}