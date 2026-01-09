// convex/vercelStorage/actions.ts
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { action } from "../_generated/server";

export const getVercelTokenAction = action({
  args: {
    userId: v.string(),
    orgId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<Doc<"vercelStorageConfigs"> | null> => {
    const data = await ctx.runQuery(
      internal.private.vercel.getVercelToken,
      args
    );
    return data as Doc<"vercelStorageConfigs"> | null;
  },
});
