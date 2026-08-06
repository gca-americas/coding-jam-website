import { closeSync, openSync, readSync } from "node:fs";

/**
 * Pixel dimensions of a PNG, GIF or JPEG, read from its header at build time.
 *
 * The guide pages need the real aspect ratio to reserve a slot and to avoid
 * upscaling a capture past its own resolution. Hard-coding those numbers next
 * to each step worked until someone re-recorded a capture at a different size
 * and the page quietly rendered it stretched — so they're read from the file
 * instead. Re-record a step, drop it in, done.
 *
 * Only the header is read, never the whole file: the GIFs here run to 12MB.
 */
export type ImageSize = { width: number; height: number };

export function imageSize(absPath: string): ImageSize | null {
  let fd: number | undefined;
  try {
    fd = openSync(absPath, "r");
    // Enough for PNG/GIF outright, and for the first stretch of a JPEG's
    // marker chain — the rest is read on demand below.
    const head = Buffer.alloc(65_536);
    const read = readSync(fd, head, 0, head.length, 0);
    const buf = head.subarray(0, read);

    if (buf.length >= 24 && buf.toString("ascii", 1, 4) === "PNG") {
      // IHDR is always the first chunk, so width/height sit at a fixed offset.
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    if (buf.length >= 10 && buf.toString("ascii", 0, 3) === "GIF") {
      // Logical screen descriptor, little-endian.
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }

    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      return jpegSize(buf);
    }

    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

/** Walk the JPEG marker chain to the start-of-frame, which carries the size. */
function jpegSize(buf: Buffer): ImageSize | null {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++; // Resync on padding rather than giving up.
      continue;
    }
    const marker = buf[i + 1];
    // SOF0–SOF15 carry the frame size; DHT/JPG/DAC share the range but don't.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2); // Skip this segment's payload.
  }
  return null;
}
