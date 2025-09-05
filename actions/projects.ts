'use server';

import { db } from '@/lib/db';
import { Project, projectsTable } from '@/db/schema';
import { desc } from 'drizzle-orm';


export async function createProjectAction(path: string, name: string, runCommand: string) {
  return await db.insert(projectsTable).values({
    path: path,
    name: name,
    runCommand: runCommand,
  }).returning();
}

export async function listProjectsAction() {
  return await db.select().from(projectsTable).orderBy(desc(projectsTable.id));
}


