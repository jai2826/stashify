// // convex/http.ts
// import { put } from "@vercel/blob";
// import { httpRouter } from "convex/server";
// import { internal } from "./_generated/api";
// import { httpAction } from "./_generated/server";

// const http = httpRouter();

// // 1. ADD THIS: The "Preflight" Handshake
// http.route({
//   path: "/upload",
//   method: "OPTIONS",
//   handler: httpAction(async (ctx, request) => {
//     return new Response(null, {
//       status: 204,
//       headers: {
//         "Access-Control-Allow-Origin": "http://localhost:3000", // Be specific or use "*"
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, x-file-name, x-file-size, x-metadata",
//         "Access-Control-Max-Age": "86400",
        
//       },
//     });
//   }),
// });

// // 2. YOUR POST ROUTE (Updated to use FormData)
// http.route({
//   path: "/upload",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     // 1. Get metadata from headers
//     const encodedMetadata = request.headers.get("x-metadata");
//     if (!encodedMetadata) return new Response("Missing metadata", { status: 400 });
    
//     const metadata = JSON.parse(atob(encodedMetadata));

//     // 2. Stream the body directly to Vercel Blob
//     // This supports files up to the Vercel/Convex timeout limit (usually 500MB+)
//     const blob = await put(metadata.name, request.body!, {
//       access: "public",
//       token: process.env.BLOB_READ_WRITE_TOKEN,
//     });

//     // 3. Save to DB
//     await ctx.runMutation(internal.main.media.saveMediaRecord, {
//       url: blob.url,
//       pathname: blob.pathname,
//       name: metadata.name,
//       mimeType: request.headers.get("Content-Type") || "application/octet-stream",
//       size: parseInt(request.headers.get("Content-Length") || "0"),
//       folderId: metadata.folderId, 
//       category: metadata.category,
//       tags: metadata.tags,
//     });

//     return new Response(JSON.stringify({ url: blob.url }), {
//       status: 200,
//       headers: { 
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "http://localhost:3000",
//       },
//     });
//   }),
// });

// export default http;