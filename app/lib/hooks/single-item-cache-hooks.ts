import { useQueryClient } from 'react-query';
import { ArtifactWithRelations, ProjectWithRelations, Tag } from '../definitions';

export function useSingleArtifactFromCache(artifactId: string): ArtifactWithRelations | undefined {
  const queryClient = useQueryClient();
  const artifacts = queryClient.getQueryData<ArtifactWithRelations[]>(['artifacts']);
  return artifacts?.find(artifact => artifact.id === artifactId);
}

export function useSingleProjectFromCache(projectId: string): ProjectWithRelations | undefined {
  const queryClient = useQueryClient();
  const projects = queryClient.getQueryData<ProjectWithRelations[]>(['projects']);
  return projects?.find(project => project.id === projectId);
}

export function useSingleTagFromCache(tagId: string): Tag | undefined {
  const queryClient = useQueryClient();
  const tags = queryClient.getQueryData<Tag[]>(['tags']);
  return tags?.find(tag => tag.id === tagId);
}