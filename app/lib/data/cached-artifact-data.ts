import { cache } from 'react'
import { fetchAllArtifacts } from './artifact-data'
import { ADMIN_UUID } from '../constants'
import { ArtifactWithRelations } from "../definitions/definitions";
import { ArtifactFetchOptions } from '../definitions/definitions';

export const getCachedArtifacts = cache(async (accountId: string, options: ArtifactFetchOptions ): Promise<ArtifactWithRelations[]> => {
  const artifacts = await fetchAllArtifacts(accountId, options);
  return artifacts;
});
