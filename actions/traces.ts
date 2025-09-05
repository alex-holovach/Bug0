'use server';

import { db } from '@/lib/db';
import { otelTracesTable } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const getSpans = async () => {
  const traces = await db.select().from(otelTracesTable).orderBy(desc(otelTracesTable.timestamp)).limit(100);

  return traces.map(t => t.data);
};

export const clearSpans = async () => {
  await db.delete(otelTracesTable);
};