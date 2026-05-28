import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, kycDocumentsTable, userProfilesTable } from "@workspace/db";
import {
  ListMyKycDocumentsResponse,
  RecordKycDocumentBody,
  CreateKycUploadUrlBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";

const router: IRouter = Router();

router.get("/kyc/documents", requireAuth, async (req, res): Promise<void> => {
  const items = await db
    .select()
    .from(kycDocumentsTable)
    .where(eq(kycDocumentsTable.userId, req.user!.id))
    .orderBy(desc(kycDocumentsTable.uploadedAt));
  res.json(ListMyKycDocumentsResponse.parse(items));
});

router.post("/kyc/documents", requireAuth, async (req, res): Promise<void> => {
  const parsed = RecordKycDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doc] = await db
    .insert(kycDocumentsTable)
    .values({
      userId: req.user!.id,
      docType: parsed.data.docType,
      objectKey: parsed.data.objectKey,
      status: "approved",
    })
    .returning();

  await db
    .update(userProfilesTable)
    .set({ kycCompleted: true })
    .where(eq(userProfilesTable.userId, req.user!.id));

  res.status(201).json(doc);
});

// Object storage upload URL - implemented in M3
router.post("/kyc/upload-url", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateKycUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(501).json({ error: "Object storage upload not yet configured" });
});

export default router;
