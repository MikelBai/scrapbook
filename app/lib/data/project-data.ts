'use server';

import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db/db';
import { blocks, projectBlockLinks, projects, tagAssociations, tags, } from '../db/schema';
import { Block, BaseProject, ProjectWithBlocks, Tag, BlockWithTags, ProjectWithBlocksWithTags, } from "../definitions/definitions";


export async function fetchAllProjects(accountId: string): Promise<ProjectWithBlocks[]> {
  try {
    const results = await db
      .select({
        id: projects.id,
        accountId: projects.accountId,
        name: projects.name,
        description: projects.description,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        tags: sql<Tag[]>`COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ${tags.id},
            'accountId', ${tags.accountId},
            'name', ${tags.name}
          )) FILTER (WHERE ${tags.id} IS NOT NULL),
          '[]'
        )`,
        blocks: sql<Block[]>`COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ${blocks.id},
            'accountId', ${blocks.accountId},
            'createdAt', ${blocks.createdAt},
            'updatedAt', ${blocks.updatedAt},
            'content', ${blocks.content},
            'createdBy', ${blocks.createdBy},
            'lastModifiedBy', ${blocks.lastModifiedBy}
          )) FILTER (WHERE ${blocks.id} IS NOT NULL),
          '[]'
        )`
      })
      .from(projects)
      .leftJoin(tagAssociations, and(
        eq(tagAssociations.associatedId, projects.id),
        eq(tagAssociations.entityType, 'project')
      ))
      .leftJoin(tags, eq(tags.id, tagAssociations.tagId))
      .leftJoin(projectBlockLinks, eq(projectBlockLinks.projectId, projects.id))
      .leftJoin(blocks, eq(blocks.id, projectBlockLinks.blockId))
      .where(eq(projects.accountId, accountId))
      .groupBy(projects.id)
      .orderBy(desc(projects.updatedAt));

    return results;
  } catch (error) {
    console.error('Error in fetchAllProjects:', error);
    throw error;
  }
}

export async function fetchAllProjectsWithBlocksWithTags(accountId: string): Promise<ProjectWithBlocksWithTags[]> {
  try {
    const results = await db
      .select({
        id: projects.id,
        accountId: projects.accountId,
        name: projects.name,
        description: projects.description,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        tags: sql<Tag[]>`COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ${tags.id},
            'accountId', ${tags.accountId},
            'name', ${tags.name}
          )) FILTER (WHERE ${tags.id} IS NOT NULL AND ${tagAssociations.entityType} = 'project'),
          '[]'
        )`,
        blocks: sql<BlockWithTags[]>`COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ${blocks.id},
            'accountId', ${blocks.accountId},
            'createdAt', ${blocks.createdAt},
            'updatedAt', ${blocks.updatedAt},
            'content', ${blocks.content},
            'createdBy', ${blocks.createdBy},
            'lastModifiedBy', ${blocks.lastModifiedBy},
            'tags', (
              SELECT COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', bt.id,
                'accountId', bt.account_id,
                'name', bt.name
              )), '[]')
              FROM ${tagAssociations} AS bta
              JOIN ${tags} AS bt ON bt.id = bta.tag_id
              WHERE bta.associated_id = ${blocks.id} AND bta.entity_type = 'block'
            )
          )) FILTER (WHERE ${blocks.id} IS NOT NULL),
          '[]'
        )`
      })
      .from(projects)
      .leftJoin(tagAssociations, and(
        eq(tagAssociations.associatedId, projects.id),
        eq(tagAssociations.entityType, 'project')
      ))
      .leftJoin(tags, eq(tags.id, tagAssociations.tagId))
      .leftJoin(projectBlockLinks, eq(projectBlockLinks.projectId, projects.id))
      .leftJoin(blocks, eq(blocks.id, projectBlockLinks.blockId))
      .where(eq(projects.accountId, accountId))
      .groupBy(projects.id)
      .orderBy(desc(projects.updatedAt));

    console.log('Fetch all projects with blocks and tags query:', db.select().from(projects).toSQL());
    console.log('Fetch all projects with blocks and tags result:', results);

    return results;
  } catch (error) {
    console.error('Error in fetchAllProjectsWithBlocksWithTags:', error);
    throw error;
  }
}

// export async function fetchProjectsWithExtendedBlocks(accountId: string): Promise<ProjectWithExtendedBlocks[]> {
//   // Similar to fetchAllProjects, but include block tags and projects
//   // ...
// }

// export async function fetchProjectsWithTags(accountId: string): Promise<ProjectWithTags[]> {
//   // Fetch projects with tags, but no blocks
//   // ...
// }

export async function fetchProjectsBasic(accountId: string): Promise<BaseProject[]> {
  const results = await db
    .select()
    .from(projects)
    .where(eq(projects.accountId, accountId))
    .orderBy(desc(projects.updatedAt));
  return results;
}