import React, { useState } from 'react';
import { ArtifactDetail, ProjectDetail, Tag } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TagManager } from '@/components/tagmanager';

interface ProjectFormProps {
  project?: ProjectDetail;
  artifacts: ArtifactDetail[];
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
  submitButtonText: string;
  cancelHref: string;
}

export function ProjectForm({
  project,
  artifacts,
  onSubmit,
  isSubmitting,
  submitButtonText,
  cancelHref,
}: ProjectFormProps) {
  const [tags, setTags] = useState<string[]>(project?.tags.map(tag => tag.name) || []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    tags.forEach(tag => formData.append('tags', tag));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Project Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Project Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={project?.name}
            placeholder="Enter project name"
            required
          />
        </div>

        {/* Project Description */}
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Project Description
          </label>
          <textarea
            id="description"
            name="description"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={project?.description}
            placeholder="Enter project description"
          ></textarea>
        </div>

        {/* Project Status */}
        <div className="mb-4">
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Project Status
          </label>
          <select
            id="status"
            name="status"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={project?.status || 'pending'}
            required
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Artifacts */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Associated Artifacts
          </label>
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="flex items-center">
              <input
                type="checkbox"
                id={`artifact-${artifact.id}`}
                name="artifacts"
                value={artifact.id}
                defaultChecked={project?.artifacts?.some(a => a.id === artifact.id) || false}
                className="mr-2"
              />
              <label htmlFor={`artifact-${artifact.id}`}>{artifact.name}</label>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Tags
          </label>
          <TagManager initialTags={tags} onTagsChange={setTags} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href={cancelHref}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}