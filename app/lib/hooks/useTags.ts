import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Fuse from 'fuse.js';
import { Tag } from '@/app/lib/definitions';
import { createTag, updateTag, deleteTag } from '@/app/lib/actions/tag-actions';

import { ADMIN_UUID } from '@/app/lib/constants';
import { getCachedTags } from '../data/cached-tag-data';

const ITEMS_PER_PAGE = 20;

export function useTags() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: tags = [], isLoading, error } = useQuery<Tag[], Error>(
    ['tags'],
    () => getCachedTags(ADMIN_UUID),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const fuse = useMemo(() => {
    if (!tags) return null;
    return new Fuse(tags, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [tags]);

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!query) return tags;
    return fuse ? fuse.search(query).map(result => result.item) : tags;
  }, [tags, query, fuse]);

  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);

  const paginatedTags = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTags.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTags, currentPage]);

  const addTagMutation = useMutation(
    (name: string) => createTag(ADMIN_UUID, name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tags']);
      },
    }
  );

  const updateTagMutation = useMutation(
    ({ tagId, newName }: { tagId: string; newName: string }) => updateTag(ADMIN_UUID, tagId, newName),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tags']);
      },
    }
  );

  const deleteTagMutation = useMutation(
    (tagId: string) => deleteTag(ADMIN_UUID, tagId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tags']);
      },
    }
  );

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const addTag = useCallback(async (name: string) => {
    const trimmedName = name.trim().toLowerCase();
    const existingTag = tags?.find(tag => tag.name.toLowerCase() === trimmedName);
    if (existingTag) return existingTag;

    return addTagMutation.mutateAsync(trimmedName);
  }, [tags, addTagMutation]);

  const getOrCreateTags = useCallback(async (tagNames: string[]) => {
    const result: Tag[] = [];
    for (const name of tagNames) {
      const existingTag = tags?.find(tag => tag.name.toLowerCase() === name.toLowerCase());
      if (existingTag) {
        result.push(existingTag);
      } else {
        const newTag = await addTag(name);
        result.push(newTag);
      }
    }
    return result;
  }, [tags, addTag]);

  return {
    tags,
    filteredTags,
    paginatedTags,
    isLoading,
    error,
    query,
    currentPage,
    totalPages,
    handleSearch,
    handlePageChange,
    addTag,
    updateTag: updateTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    getOrCreateTags,
  };
}