CREATE TABLE `background_agent_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`agentId` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `background_agents` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`organizationId` text NOT NULL,
	`repositoryFullName` text NOT NULL,
	`integrationId` text NOT NULL,
	`environmentType` text NOT NULL,
	`model` text NOT NULL,
	`prompt` text NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`startedAt` text,
	`completedAt` text,
	`prUrl` text,
	`sandboxId` text
);
--> statement-breakpoint
CREATE TABLE `Chat` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text NOT NULL,
	`title` text NOT NULL,
	`organizationId` text NOT NULL,
	`userId` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`environmentId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Document` (
	`id` text NOT NULL,
	`createdAt` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`text` text DEFAULT 'text' NOT NULL,
	`userId` text NOT NULL,
	PRIMARY KEY(`id`, `createdAt`),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`userId` text NOT NULL,
	`organizationId` text NOT NULL,
	`externalId` text,
	`name` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Message_v2` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`role` text NOT NULL,
	`parts` text NOT NULL,
	`attachments` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Message` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `open_router_api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`organizationId` text NOT NULL,
	`apiKey` text NOT NULL,
	`usage` text NOT NULL,
	`hash` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `otel_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trace_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`data` text NOT NULL,
	`servicename` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `otel_traces` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trace_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`data` text NOT NULL,
	`servicename` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'stopped' NOT NULL,
	`runCommand` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sandboxes` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`githubRepo` text,
	`type` text NOT NULL,
	`sandboxId` text,
	`previewUrl` text,
	`vscodeUrl` text,
	`data` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Stream` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Suggestion` (
	`id` text PRIMARY KEY NOT NULL,
	`documentId` text NOT NULL,
	`documentCreatedAt` text NOT NULL,
	`originalText` text NOT NULL,
	`suggestedText` text NOT NULL,
	`description` text,
	`isResolved` integer DEFAULT false NOT NULL,
	`userId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`documentId`,`documentCreatedAt`) REFERENCES `Document`(`id`,`createdAt`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text
);
--> statement-breakpoint
CREATE TABLE `vibe_kit_job_pull_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jobId` integer NOT NULL,
	`data` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`jobId`) REFERENCES `vibe_kit_jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vibe_kit_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organizationId` text NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Vote_v2` (
	`chatId` text NOT NULL,
	`messageId` text NOT NULL,
	`isUpvoted` integer NOT NULL,
	PRIMARY KEY(`chatId`, `messageId`),
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`messageId`) REFERENCES `Message_v2`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Vote` (
	`chatId` text NOT NULL,
	`messageId` text NOT NULL,
	`isUpvoted` integer NOT NULL,
	PRIMARY KEY(`chatId`, `messageId`),
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON UPDATE no action ON DELETE no action
);
