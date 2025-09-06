import { InferSelectModel, sql } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';

export const vibeKitJobsTable = sqliteTable('vibe_kit_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});

export const vibeKitJobPullRequestsTable = sqliteTable(
  'vibe_kit_job_pull_requests',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    jobId: integer('jobId')
      .notNull()
      .references(() => vibeKitJobsTable.id),
    data: text('data', { mode: 'json' }).notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
  }
);

export const user = sqliteTable('User', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull(),
  password: text('password'),
});

export type User = InferSelectModel<typeof user>;

export const chat = sqliteTable('Chat', {
  id: text('id').primaryKey().notNull(),
  createdAt: text('createdAt').notNull(),
  title: text('title').notNull(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  environmentId: text('environmentId').notNull(),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = sqliteTable('Message', {
  id: text('id').primaryKey().notNull(),
  chatId: text('chatId')
    .notNull()
    .references(() => chat.id),
  role: text('role').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
  createdAt: text('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = sqliteTable('Message_v2', {
  id: text('id').primaryKey().notNull(),
  chatId: text('chatId')
    .notNull()
    .references(() => chat.id),
  role: text('role').notNull(),
  parts: text('parts', { mode: 'json' }).notNull(),
  attachments: text('attachments', { mode: 'json' }).notNull(),
  createdAt: text('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = sqliteTable(
  'Vote',
  {
    chatId: text('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: text('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: integer('isUpvoted', { mode: 'boolean' }).notNull(),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = sqliteTable(
  'Vote_v2',
  {
    chatId: text('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: text('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: integer('isUpvoted', { mode: 'boolean' }).notNull(),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = sqliteTable(
  'Document',
  {
    id: text('id').notNull(),
    createdAt: text('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: text('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = sqliteTable(
  'Suggestion',
  {
    id: text('id').notNull(),
    documentId: text('documentId').notNull(),
    documentCreatedAt: text('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: integer('isResolved', { mode: 'boolean' }).notNull().default(false),
    userId: text('userId').notNull(),
    createdAt: text('createdAt').notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = sqliteTable(
  'Stream',
  {
    id: text('id').notNull(),
    chatId: text('chatId').notNull(),
    createdAt: text('createdAt').notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const integrationsTable = sqliteTable('integrations', {
  id: text('id').primaryKey().notNull(),
  type: text('type').notNull(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  externalId: text('externalId'),
  name: text('name').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export type Integration = InferSelectModel<typeof integrationsTable>;
export type SandboxType = '2g' | '4g' | '8g' | '16g' | '32g' | '64g';


export const sandboxesTable = sqliteTable('sandboxes', {
  id: text('id').primaryKey().notNull(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  githubRepo: text('githubRepo'),
  type: text('type', { enum: ['2g', '4g', '8g', '16g', '32g', '64g'] }).notNull(),
  sandboxId: text('sandboxId'),
  previewUrl: text('previewUrl'),
  vscodeUrl: text('vscodeUrl'),
  data: text('data', { mode: 'json' }),
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const backgroundAgentsTable = sqliteTable('background_agents', {
  id: text('id').primaryKey().notNull(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  repositoryFullName: text('repositoryFullName').notNull(),
  integrationId: text('integrationId').notNull(),
  environmentType: text('environmentType').notNull(),
  model: text('model').notNull(),
  prompt: text('prompt').notNull(),
  status: text('status', { enum: ['todo', 'in_progress', 'done', 'failed'] as const }).notNull().default('todo'),
  createdAt: text('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  startedAt: text('startedAt'),
  completedAt: text('completedAt'),
  prUrl: text('prUrl'),
  sandboxId: text('sandboxId'),
});

export const backgroundAgentLogsTable = sqliteTable('background_agent_logs', {
  id: text('id').primaryKey().notNull(),
  agentId: text('agentId').notNull(),
  type: text('type', { enum: ['log', 'error', 'pull-request', 'fatal'] as const }).notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: text('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type BackgroundAgent = InferSelectModel<typeof backgroundAgentsTable>;


// Projects table
export const projectsTable = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['running', 'stopped'] }).notNull().default('stopped'),
  runCommand: text('runCommand').notNull(),
});

export type Project = InferSelectModel<typeof projectsTable>;

// OpenTelemetry tables for trace and log ingestion (simplified schema)
export const otelTracesTable = sqliteTable('otel_traces', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trace_id: text('trace_id').notNull(),
  timestamp: text('timestamp').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  servicename: text('servicename').notNull(),
});

export type OtelTrace = InferSelectModel<typeof otelTracesTable>;

export const otelLogsTable = sqliteTable('otel_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trace_id: text('trace_id').notNull(),
  timestamp: text('timestamp').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  servicename: text('servicename').notNull(),
});

export type OtelLog = InferSelectModel<typeof otelLogsTable>;