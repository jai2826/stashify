// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { put } from "@vercel/blob";
import { internal } from "../_generated/api";

const http = httpRouter();

http.route({
  path: "/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const metadata = await request.json();

    // We pass the request body (a ReadableStream) directly to Vercel's 'put'
    const blob = await put(metadata.name, request.body!, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Save to DB via Mutation
    await ctx.runMutation(
      internal.main.media.saveMediaRecord,
      {
        url: blob.url,
        pathname: blob.pathname,
        name: metadata.name,
        mimeType:
          blob.contentType || "application/octet-stream",
        size: metadata.size,
        parentId: undefined,
        category: undefined,
        folderId: undefined,
        tags: [],
      }
    );

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
