// app/api/upload/route.ts
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server"; // Using Convex server-side client
import {
  api,
  internal,
} from "@workspace/backend/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export async function POST(
  request: Request
): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    // 1. Get the payload to identify the user
    if (!("clientPayload" in body.payload)) {
      throw new Error("Invalid payload structure");
    }
    const { userId, orgId } = JSON.parse(
      body.payload.clientPayload || "{}"
    );

    // 2. Fetch the user's token BEFORE calling handleUpload
    const userConfig = await convex.action(
      api.system.vercel.getVercelTokenAction,
      { userId, orgId }
    );

    const token = userConfig?.vercelBlobReadWriteToken;

    if (!token) {
      throw new Error(
        "No Vercel Blob token configured for this account."
      );
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      token, // PASS THE TOKEN DIRECTLY HERE
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "video/mp4",
          ],
          tokenPayload: JSON.stringify({ userId, orgId }),
          allowOverwrite: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
