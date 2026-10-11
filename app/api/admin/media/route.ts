import { put } from "@vercel/blob";
import { adminAccess, json, sameOrigin } from "@/lib/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request) || !(await adminAccess()).allowed) return json({ error: "Admin access required" }, 403);
    const data = await request.formData(); const file = data.get("file");
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || file.size < 12) return json({ error: "Choose a JPG, PNG or WebP image up to 5 MB" }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer()); let type = "";
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) type = "image/jpeg";
    else if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) type = "image/png";
    else if (new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") type = "image/webp";
    if (!type) return json({ error: "Unsupported image format" }, 400);
    if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: "Configure Vercel Blob storage" }, 503);
    const ext = type === "image/png" ? "png" : type === "image/jpeg" ? "jpg" : "webp";
    const blob = await put(`media/${crypto.randomUUID()}.${ext}`, new Blob([bytes], { type }), { access: "public", addRandomSuffix: false, contentType: type });
    return json({ url: blob.url }, 201);
  } catch (error) { console.error("Image upload failed", error); return json({ error: "Image upload failed" }, 500); }
}
