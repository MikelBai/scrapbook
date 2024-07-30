import { z } from 'zod';
import { artifactContents, artifacts, projects, tags } from '../db/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Account = {
  id: string; // Primary key
  name: string;
  email: string; // Unique
  password?: string;
  provider?: string;
  providerAccountId?: string;
  lastLogin?: Date;
};

export interface ProjectFetchOptions {
  includeTags: boolean;
  includeArtifacts: boolean;
  artifactDetail: 'none' | 'basic' | 'withContents' | 'extended';
}

export interface ArtifactFetchOptions {
  includeTags: boolean;
  includeContents: boolean;
  includeProjects: boolean;
}

export type Tag = InferSelectModel<typeof tags>;
// export type InsertTag = InferInsertModel<typeof tags>;


export const ContentTypeSchema = z.enum(['text', 'image', 'file', 'link',]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export type S3Usage = {
  id: number;
  accountId: string;
  month: number;
  year: number;
  count: number;
};
export type ArtifactContent = InferSelectModel<typeof artifactContents>;
export type InsertArtifactContent = InferInsertModel<typeof artifactContents>;

export type BaseArtifact = InferSelectModel<typeof artifacts>;

export type Artifact = BaseArtifact & {
  contents: ArtifactContent[];
};

export type ArtifactWithTags = Artifact & {
  tags: Tag[];
};

export type ArtifactWithProjects = Artifact & {
  projects: BaseProject[];
};

export type ArtifactWithRelations = ArtifactWithTags & ArtifactWithProjects;

export type BaseProject = InferSelectModel<typeof projects>;

export type ProjectPreview = BaseProject & {
  previewArtifact?: {
    id?: string | null;
    name?: string | null;
    previewContent?: string | null;
  } | null;
};

export type ProjectWithTags = BaseProject & {
  tags: Tag[];
};

export type ProjectWithArtifacts = ProjectWithTags & {
  artifacts: Artifact[];
};

export type ProjectWithExtendedArtifacts = ProjectWithTags & {
  artifacts: ArtifactWithRelations[];
};

const BaseMetadataSchema = z.object({
  order: z.number().int().nonnegative(),
});


const ImageMetadataSchema = BaseMetadataSchema.extend({
  variations: z.record(z.string()).optional(),
});

const LinkMetadataSchema = BaseMetadataSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  previewImage: z.string().optional(),
});

// Combined metadata schema
export const ContentMetadataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), ...BaseMetadataSchema.shape }),
  z.object({ type: z.literal('image'), ...ImageMetadataSchema.shape }),
  z.object({ type: z.literal('file'), ...BaseMetadataSchema.shape }),
  z.object({ type: z.literal('link'), ...LinkMetadataSchema.shape }),
]);
