// Legacy R2 URLs have no storage in Vercel. New uploads are served by Vercel Blob.
export const runtime = "nodejs";
export async function GET() { return new Response("Legacy media not available; re-upload this image from admin.", { status: 404 }); }
