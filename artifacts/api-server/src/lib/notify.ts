import { db, notificationsTable } from "@workspace/db";

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
): Promise<void> {
  await db.insert(notificationsTable).values({ userId, type, title, body });
}
