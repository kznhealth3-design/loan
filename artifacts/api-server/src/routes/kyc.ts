import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, kycDocumentsTable, userProfilesTable } from "@workspace/db";
import {
  ListMyKycDocumentsResponse,
  RecordKycDocumentBody,
  CreateKycUploadUrlBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/requireAuth";
import { generateKycUploadUrl } from "../lib/kycStorage";

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

  const existing = await db
    .select()
    .from(kycDocumentsTable)
    .where(eq(kycDocumentsTable.userId, req.user!.id));

  const alreadyHasType = existing.some((d) => d.docType === parsed.data.docType);
  if (alreadyHasType) {
    await db
      .update(kycDocumentsTable)
      .set({ objectKey: parsed.data.objectKey, status: "pending" })
      .where(
        and(
          eq(kycDocumentsTable.userId, req.user!.id),
          eq(kycDocumentsTable.docType, parsed.data.docType),
        ),
      );
  } else {
    await db.insert(kycDocumentsTable).values({
      userId: req.user!.id,
      docType: parsed.data.docType,
      objectKey: parsed.data.objectKey,
      status: "pending",
    });
  }

  const allDocs = await db
    .select()
    .from(kycDocumentsTable)
    .where(eq(kycDocumentsTable.userId, req.user!.id));

  const docTypes = new Set(allDocs.map((d) => d.docType));
  if (docTypes.has("identity") && docTypes.has("address") && docTypes.has("selfie")) {
    await db
      .update(userProfilesTable)
      .set({ kycCompleted: true })
      .where(eq(userProfilesTable.userId, req.user!.id));
  }

  const [doc] = await db
    .select()
    .from(kycDocumentsTable)
    .where(
      and(
        eq(kycDocumentsTable.userId, req.user!.id),
        eq(kycDocumentsTable.docType, parsed.data.docType),
      ),
    )
    .orderBy(desc(kycDocumentsTable.uploadedAt))
    .limit(1);

  res.status(201).json(doc);
});

router.post("/kyc/upload-url", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateKycUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const { uploadUrl, objectKey } = await generateKycUploadUrl();
    res.json({ uploadUrl, objectKey });
  } catch (err) {
    req.log.error({ err }, "Failed to generate KYC upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

export default router;
