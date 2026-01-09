import { ConvexError, v } from "convex/values";
import {
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import {
  mustGetIdentity,
  validateAccess,
} from "../utils/auth";

export const getVercelConfig = query({
  args: {},
  handler: async (ctx) => {
    const { orgId, userId } = await mustGetIdentity(ctx);

    const config = await ctx.db
      .query("vercelStorageConfigs")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", orgId).eq("userId", userId)
      )
      .unique();

    return config;
  },
});
export const saveVercelConfig = mutation({
  args: {
    vercelBlobReadWriteToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgId, userId } = await mustGetIdentity(ctx);

    const fetchConfig = await ctx.db
      .query("vercelStorageConfigs")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", orgId).eq("userId", userId)
      )
      .unique();

    if (fetchConfig) {
      const updatedConfig = await ctx.db.patch(
        "vercelStorageConfigs",
        fetchConfig._id,
        {
          vercelBlobReadWriteToken:
            args.vercelBlobReadWriteToken || undefined,
        }
      );
      return updatedConfig;
    }
    const config = await ctx.db.insert(
      "vercelStorageConfigs",
      {
        organizationId: orgId,
        userId: userId,
        vercelBlobReadWriteToken:
          args.vercelBlobReadWriteToken || undefined,
      }
    );

    return config;
  },
});

// This query is used to securely fetch the Vercel token for server-side operations
export const getVercelToken = internalQuery({
  args: {
    userId: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("vercelStorageConfigs")
      .withIndex("by_organization_user", (q) =>
        q
          .eq("organizationId", args.orgId)
          .eq("userId", args.userId)
      )
      .unique();

    if (!config) return null;

    return config; // Returns the raw token securely
  },
});
