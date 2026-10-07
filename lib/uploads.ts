/**
 * Cloud Storage uploads for project screenshots.
 *
 * The bucket name comes from GCS_UPLOADS_BUCKET. The bucket is expected to be
 * publicly readable (uniform bucket-level access + allUsers:objectViewer) so
 * the returned URL can be embedded directly in <img> tags. The deploy script
 * provisions it that way.
 */

import { Storage } from "@google-cloud/storage";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MiB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

let storage: Storage | null = null;
function getStorage(): Storage {
  if (!storage) storage = new Storage();
  return storage;
}

export type UploadResult = { url: string };
export class UploadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function uploadScreenshot(file: File, prefix: string): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError(415, `Unsupported image type: ${file.type || "unknown"}`);
  }
  if (file.size === 0) {
    throw new UploadError(400, "File is empty.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(413, `File too large (max ${MAX_BYTES / 1024 / 1024} MiB).`);
  }

  const ext = extensionFor(file.type);
  const objectName = `${prefix}/${randomBytes(12).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const bucketName = process.env.GCS_UPLOADS_BUCKET;
  if (!bucketName) {
    if (process.env.NODE_ENV !== "production") {
      const targetPath = path.join(process.cwd(), "public", "uploads", objectName);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, buffer);
      return { url: `/uploads/${objectName}` };
    }
    throw new UploadError(500, "Upload bucket is not configured (set GCS_UPLOADS_BUCKET).");
  }

  const bucket = getStorage().bucket(bucketName);
  const blob = bucket.file(objectName);

  await blob.save(buffer, {
    contentType: file.type,
    resumable: false,
    metadata: { cacheControl: "public, max-age=31536000, immutable" },
  });

  return { url: `https://storage.googleapis.com/${bucketName}/${objectName}` };
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}
