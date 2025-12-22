import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";

export const getFilesByOrganization = query({
  args: {
    userId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (orgId === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    const userId = identity.userId as string;
    if (userId === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    const media = await ctx.db
      .query("media")
      .withIndex("by_organizationId_userId", (q) =>
        q
          .eq(
            "organizationId",
            args.organizationId ?? orgId
          )
          .eq("userId", args.userId ?? userId)
      )
      .order("desc")
      .collect();

    return media;
  },
});
