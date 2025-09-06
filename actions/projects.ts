'use server';

import { db } from '@/lib/db';
import { Project, projectsTable } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';


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

export async function setProjectUrlCookieAction(projectUrl: string) {
  const cookieStore = await cookies();
  cookieStore.set('current-project-url', projectUrl, {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function setProjectIdCookieAction(projectId: number) {
  const cookieStore = await cookies();
  cookieStore.set('current-project-id', projectId.toString(), {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function setProjectCookiesAction(projectUrl: string, projectId: number) {
  const cookieStore = await cookies();
  cookieStore.set('current-project-url', projectUrl, {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  cookieStore.set('current-project-id', projectId.toString(), {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

