import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userProfilesTable } from "@workspace/db";
import {
  GetMyProfileResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";

const router: IRouter = Router();

router.get("/me/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  let [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, userId));

  if (!profile) {
    [profile] = await db
      .insert(userProfilesTable)
      .values({ userId })
      .returning();
  }

  res.json(GetMyProfileResponse.parse(profile));
});

router.put("/me/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, userId));

  let updated;
  if (existing.length === 0) {
    [updated] = await db
      .insert(userProfilesTable)
      .values({ userId, ...parsed.data })
      .returning();
  } else {
    [updated] = await db
      .update(userProfilesTable)
      .set(parsed.data)
      .where(eq(userProfilesTable.userId, userId))
      .returning();
  }

  res.json(UpdateMyProfileResponse.parse(updated));
});

export default router;
