import { randomUUID } from "crypto";

const SIDECAR = "http://127.0.0.1:1106";

function getPrivateDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR ?? "";
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR not set. Add it in Object Storage settings.");
  return dir;
}

function parsePath(p: string): { bucket: string; object: string } {
  if (!p.startsWith("/")) p = `/${p}`;
  const parts = p.split("/");
  if (parts.length < 3) throw new Error(`Invalid object path: ${p}`);
  return { bucket: parts[1], object: parts.slice(2).join("/") };
}

async function signedUrl(bucket: string, object: string, method: "PUT" | "GET", ttlSec: number): Promise<string> {
  const res = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucket,
      object_name: object,
      method,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sidecar error ${res.status}: ${await res.text()}`);
  const { signed_url } = await res.json() as { signed_url: string };
  return signed_url;
}

export async function generateKycUploadUrl(): Promise<{ uploadUrl: string; objectKey: string }> {
  const privateDir = getPrivateDir();
  const id = randomUUID();
  const fullPath = `${privateDir}/kyc/${id}`;
  const { bucket, object } = parsePath(fullPath);

  const uploadUrl = await signedUrl(bucket, object, "PUT", 900);

  const url = new URL(uploadUrl);
  const rawPath = url.pathname;
  let dir = privateDir.endsWith("/") ? privateDir : `${privateDir}/`;
  const entityId = rawPath.startsWith(dir) ? rawPath.slice(dir.length) : rawPath;
  const objectKey = `/objects/${entityId}`;

  return { uploadUrl, objectKey };
}
