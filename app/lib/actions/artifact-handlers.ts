'use server';

import { eq, and } from 'drizzle-orm';
import { artifacts, artifactContents, artifactTags, projectArtifactLinks } from '../db/schema';
import { handleContentUpdate, hasValidContent, insertContents } from './artifact-content-actions';
import { handleTagUpdateWithinTransaction } from './tag-handlers';
import { handleProjectUpdateWithinTransaction } from './project-handlers';
import { deleteFromS3 } from '../external/s3-operations';
import { v4 as uuid } from 'uuid';

export async function handleArtifactUpdateWithinTransaction(
  tx: any,
  accountId: string,
  artifactId: string,
  name: string,
  description: string | undefined,
  tags: string[],
  projects: string[],
  formData: FormData
): Promise<void> {
  await tx.update(artifacts)
    .set({ name, description, updatedAt: new Date() })
    .where(and(
      eq(artifacts.id, artifactId),
      eq(artifacts.accountId, accountId)
    ));

  const hasContent = await handleContentUpdate(accountId, artifactId, formData);

  if (!hasContent) {
    throw new Error('Artifact must have at least one content item.');
  }

  await handleTagUpdateWithinTransaction(tx, accountId, artifactId, tags, false);
  await handleProjectUpdateWithinTransaction(tx, accountId, artifactId, projects);
}

export async function handleArtifactDeleteWithinTransaction(
  tx: any,
  accountId: string,
  artifactId: string
): Promise<void> {
  await tx.delete(artifactTags).where(and(eq(artifactTags.artifactId, artifactId), eq(artifactTags.accountId, accountId)));
  await tx.delete(projectArtifactLinks).where(and(eq(projectArtifactLinks.artifactId, artifactId), eq(projectArtifactLinks.accountId, accountId)));
  
  const contents = await tx.select().from(artifactContents)
    .where(and(eq(artifactContents.artifactId, artifactId), eq(artifactContents.accountId, accountId)));

  for (const content of contents) {
    if (content.type === 'image' || content.type === 'file') {
      await deleteFromS3(content.content);
    }
  }

  await tx.delete(artifactContents).where(and(eq(artifactContents.artifactId, artifactId), eq(artifactContents.accountId, accountId)));
  await tx.delete(artifacts).where(and(eq(artifacts.id, artifactId), eq(artifacts.accountId, accountId)));
}

export async function handleArtifactCreateWithinTransaction(
  tx: any,
  accountId: string,
  name: string,
  description: string | undefined,
  tags: string[],
  projects: string[],
  formData: FormData
): Promise<string> {
  const newArtifactId = uuid();
  const now = new Date();

  await tx.insert(artifacts).values({ 
    id: newArtifactId,
    accountId, 
    name, 
    description, 
    createdAt: now, 
    updatedAt: now 
  });

  await insertContents(tx, accountId, newArtifactId, formData);

  if (tags.length > 0) {
    await handleTagUpdateWithinTransaction(tx, accountId, newArtifactId, tags, false);
  }

  if (projects.length > 0) {
    await handleProjectUpdateWithinTransaction(tx, accountId, newArtifactId, projects);
  }

  return newArtifactId;
}