import { pgTable, pgView, uuid, text, varchar, timestamp, integer, serial, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql,eq, ne, gt, gte, } from "drizzle-orm";

export const accounts = pgTable('account', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: text('password'),
  provider: varchar('provider', { length: 255 }),
  providerAccountId: varchar('provider_account_id', { length: 255 }),
  lastLogin: timestamp('last_login'),
}, (table) => ({
  emailIndex: uniqueIndex('users_email_key').on(table.email),
}));

export const tags = pgTable('tag', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  name: text('name').notNull(),
}, (table) => ({
  accountNameIndex: uniqueIndex('tag_account_id_name_key').on(table.accountId, table.name),
}));

export const projects = pgTable('project', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  status: text('status').notNull(),
});

export const artifacts = pgTable('artifact', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const artifactContents = pgTable('artifact_content', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id),
  type: text('type').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const projectTags = pgTable('project_tag', {
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  tagId: uuid('tag_id').notNull().references(() => tags.id),
}, (table) => ({
  projectTagIndex: uniqueIndex('project_tag_project_id_tag_id_key').on(table.projectId, table.tagId),
}));

export const artifactTags = pgTable('artifact_tag', {
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id),
  tagId: uuid('tag_id').notNull().references(() => tags.id),
}, (table) => ({
  artifactTagIndex: uniqueIndex('artifact_tag_artifact_id_tag_id_key').on(table.artifactId, table.tagId),
}));

export const projectArtifactLinks = pgTable('project_artifact_link', {
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id),
  addedAt: timestamp('added_at').notNull().defaultNow(),
});

export const artifactsView = pgView('artifacts_view').as((qb) => {
  return qb
    .select({
      id: artifacts.id,
      name: artifacts.name,
      description: artifacts.description,
      createdAt: artifacts.createdAt,
      updatedAt: artifacts.updatedAt,
      contents: sql<string>`
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${artifactContents.id},
          'type', ${artifactContents.type},
          'content', ${artifactContents.content},
          'createdAt', ${artifactContents.createdAt}
        ))
      `.as('contents'),
      tags: sql<string>`
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${tags.id},
          'name', ${tags.name}
        ))
      `.as('tags'),
      projects: sql<string>`
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${projects.id},
          'name', ${projects.name},
          'status', ${projects.status}
        ))
      `.as('projects')
    })
    .from(artifacts)
    .leftJoin(artifactContents, eq(artifacts.id, artifactContents.artifactId))
    .leftJoin(artifactTags, eq(artifacts.id, artifactTags.artifactId))
    .leftJoin(tags, eq(artifactTags.tagId, tags.id))
    .leftJoin(projectArtifactLinks, eq(artifacts.id, projectArtifactLinks.artifactId))
    .leftJoin(projects, eq(projectArtifactLinks.projectId, projects.id))
    .groupBy(artifacts.id);
});

export const s3Usage = pgTable('s3_usage', {
  id: serial('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  count: integer('count').notNull().default(0),
}, (table) => ({
  accountMonthYearIndex: uniqueIndex('s3_usage_account_id_month_year_key').on(table.accountId, table.month, table.year),
}));