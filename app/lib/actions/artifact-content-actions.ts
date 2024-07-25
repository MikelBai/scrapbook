'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.server';
import { ContentType, ArtifactContent, ContentVariant, Annotation, EmbedData, } from '../definitions';
import { uploadToS3, deleteFromS3 } from '../external/s3-operations';
import { artifactContents } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { processAndUploadImage } from '../image-processing/image-processing';

export async function handleContentUpdate(accountId: string, artifactId: string, formData: FormData): Promise<boolean> {
  const existingContents = await fetchExistingContents(accountId, artifactId);
  const existingContentIds = new Set(existingContents.map(row => row.id));
  let newContentCount = 0;

  let index = 0;
  while (formData.get(`contentType-${index}`) !== null) {
    const { contentType, content, contentId } = await processContentItem(accountId, formData, index);

    if (content) {
      if (contentId) {
        await updateExistingContent(accountId, contentId, contentType, content);
        existingContentIds.delete(contentId);
      } else {
        await insertNewContent(accountId, artifactId, contentType, content);
      }
      newContentCount++;
    } else if (contentId) {
      existingContentIds.delete(contentId);
    }

    index++;
  }

  await deleteRemovedContents(accountId, existingContents, existingContentIds);

  return newContentCount > 0;
}

async function fetchExistingContents(accountId: string, artifactId: string): Promise<ArtifactContent[]> {
  return db.select()
    .from(artifactContents)
    .where(and(
      eq(artifactContents.artifactId, artifactId),
      eq(artifactContents.accountId, accountId)
    ))
    .then(rows => rows.map(row => ({
      ...row,
      type: row.type as ContentType,
      variants: row.variants as ContentVariant[] | undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      embed: row.embed as EmbedData | undefined,
      annotations: row.annotations as Annotation[] | undefined,
      createdBy: row.createdBy || accountId, // Fallback to accountId if createdBy is null
      lastModifiedBy: row.lastModifiedBy || accountId, // Fallback to accountId if lastModifiedBy is null
    })));
}

async function processContentItem(accountId: string, formData: FormData, index: number): Promise<{ contentType: ContentType; content: string; contentId: string | null }> {
  const contentType = formData.get(`contentType-${index}`) as ContentType;
  const contentItem = formData.get(`content-${index}`);
  const contentId = formData.get(`contentId-${index}`) as string | null;

  switch (contentType) {
    case 'text':
    case 'longText':
      return {
        contentType,
        content: (contentItem as string).trim(),
        contentId
      };

    case 'image':
    case 'file':
      if (!(contentItem instanceof File)) {
        throw new Error(`Invalid ${contentType} content`);
      }
      const fileUrl = await uploadToS3(contentItem, contentType, accountId, 'original');
      return {
        contentType,
        content: fileUrl,
        contentId
      };

    case 'link':
    case 'embed':
      return {
        contentType,
        content: contentItem as string,
        contentId
      };

    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

async function updateExistingContent(accountId: string, contentId: string, contentType: ContentType, content: string): Promise<void> {
  await db.update(artifactContents)
    .set({ 
      type: contentType, 
      content: content, 
      updatedAt: new Date(),
      lastModifiedBy: accountId
    })
    .where(and(
      eq(artifactContents.id, contentId),
      eq(artifactContents.accountId, accountId)
    ));
}

async function insertNewContent(accountId: string, artifactId: string, contentType: ContentType, content: string): Promise<void> {
  await db.insert(artifactContents).values({
    id: uuidv4(),
    accountId,
    artifactId,
    type: contentType,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: accountId,
    lastModifiedBy: accountId
  });
}

export async function deleteRemovedContents(accountId: string, existingContents: ArtifactContent[], existingContentIds: Set<string>): Promise<void> {
  for (const contentId of existingContentIds) {
    const contentToDelete = existingContents.find(row => row.id === contentId);
    if (contentToDelete) {
      if (contentToDelete.type === 'image') {
        // Delete the main content (original image)
        await deleteFromS3(contentToDelete.content);
        
        // Delete variants (thumbnails and compressed version)
        if (contentToDelete.variants) {
          for (const variant of contentToDelete.variants) {
            await deleteFromS3(variant.url);
          }
        }
        if (contentToDelete.metadata && typeof contentToDelete.metadata.compressed === 'string') {
          await deleteFromS3(contentToDelete.metadata.compressed);
        }
      } else if (contentToDelete.type === 'file') {
        // Delete the file
        await deleteFromS3(contentToDelete.content);
      }

      // Delete the content record from the database
      await db.delete(artifactContents)
        .where(and(
          eq(artifactContents.id, contentId),
          eq(artifactContents.accountId, accountId)
        ));
    }
  }
}

export async function hasValidContent(formData: FormData): Promise<boolean> {
  let index = 0;
  while (formData.get(`contentType-${index}`)) {
    const contentItem = formData.get(`content-${index}`);
    if (contentItem && (typeof contentItem === 'string' ? contentItem.trim() !== '' : true)) {
      return true;
    }
    index++;
  }
  return false;
}

export async function insertContents(tx: any, accountId: string, artifactId: string, formData: FormData): Promise<string> {
  let allContent = '';
  let index = 0;
  while (formData.get(`contentType-${index}`)) {
    const contentType = formData.get(`contentType-${index}`) as ContentType;
    const contentItem = formData.get(`content-${index}`);

    let content: string;
    let variants: ContentVariant[] | undefined;
    let metadata: Record<string, unknown> | undefined;

    if (contentType === 'text' || contentType === 'longText') {
      content = contentItem as string;
      allContent += content + ' ';
      metadata = { wordCount: content.trim().split(/\s+/).length };
    } else if (contentType === 'image' && contentItem instanceof File) {
      const processedImage = await processAndUploadImage(contentItem, accountId);
      content = processedImage.original;
      variants = Object.entries(processedImage.thumbnails).map(([key, url]) => ({ type: key, url }));
      metadata = { 
        originalName: contentItem.name,
        size: contentItem.size,
        compressed: processedImage.compressed
      };
    } else if (contentType === 'file' && contentItem instanceof File) {
      content = await uploadToS3(contentItem, contentType, accountId, 'original');
      metadata = {
        originalName: contentItem.name,
        size: contentItem.size,
        mimeType: contentItem.type
      };
    } else if (contentType === 'link' || contentType === 'embed') {
      content = contentItem as string;
      metadata = {
        title: formData.get(`${contentType}Title-${index}`),
        description: formData.get(`${contentType}Description-${index}`)
      };
    } else {
      throw new Error(`Invalid content for type ${contentType}`);
    }

    await tx.insert(artifactContents).values({
      id: uuidv4(),
      accountId,
      artifactId,
      type: contentType,
      content,
      variants,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: accountId,
      lastModifiedBy: accountId
    });

    index++;
  }
  return allContent;
}