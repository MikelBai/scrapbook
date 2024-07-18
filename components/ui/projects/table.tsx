'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { TagList } from '@/components/ui/tags/taglist';
import { DeleteProject, UpdateProject } from '@/components/ui/projects/button';
import Pagination from '../pagination';
import { useProjects } from '@/app/lib/hooks/useProjects';
import { useTagStore } from '@/app/lib/store/tag-store';
import { ErrorBoundaryWithToast } from '../errors/error-boundary';
import { ProjectWithRelations, Tag } from '@/app/lib/definitions';
import { ArtifactThumbnail } from '../artifacts/artifact-thumbnail';

export function ProjectsTable({ accountId }: { accountId: string }) {
  const { 
    paginatedProjects,
    isLoading,
    error,
    updateProject,
    deleteProject,
    handleSearch,
    handlePageChange,
    currentPage,
    totalPages,
    updateProjectTags,
  } = useProjects();

  const { allTags, ensureTagsExist } = useTagStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const page = Number(searchParams.get('page')) || 1;
    handleSearch(query);
    handlePageChange(page);
  }, [searchParams, handleSearch, handlePageChange]);

  const handleTagsChange = async (projectId: string, newTags: Tag[]) => {
    const tags = await ensureTagsExist(accountId, newTags.map(tag => tag.name));
    await updateProjectTags({ projectId, tags: tags.map(tag => tag.name) });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, handlePageChange]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-5 font-medium">Description</th>
                  <th scope="col" className="px-3 py-5 font-medium">Status</th>
                  <th scope="col" className="px-3 py-5 font-medium">Tags</th>
                  <th scope="col" className="px-3 py-5 font-medium">Artifacts</th>
                  <th scope="col" className="px-3 py-5 font-medium">Updated</th>
                  <th scope="col" className="px-3 py-5 font-medium">Preview</th>
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedProjects.map((project: ProjectWithRelations) => (
                  <tr key={project.id} className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <p className="font-medium">{project.name}</p>
                    </td>
                    <td className="px-3 py-3">{project.description}</td>
                    <td className="whitespace-nowrap px-3 py-3">{project.status}</td>
                    <td className="px-3 py-3">
                      <TagList
                        initialTags={project.tags}
                        allTags={allTags}
                        onTagsChange={(newTags) => handleTagsChange(project.id, newTags)}
                        accountId={accountId}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{project.artifacts.length}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex space-x-2">
                        {project.artifacts.slice(0, 3).map((artifact) => (
                          <div key={artifact.id} className="w-10 h-10 relative overflow-hidden rounded-full">
                            <ErrorBoundaryWithToast>
                              <ArtifactThumbnail
                                artifact={artifact}
                                size={40}
                                priority={true}
                                className="flex-shrink-0"
                              />
                            </ErrorBoundaryWithToast>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end">
                        <UpdateProject id={project.id} />
                        <DeleteProject 
                          id={project.id} 
                          onDelete={() => deleteProject(project.id)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination 
          totalPages={totalPages} 
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}