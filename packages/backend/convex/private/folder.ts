import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";

export const createFolder = mutation({
  args: {
    name: v.string(),
    isPublic: v.boolean(),
    parentFolderId: v.optional(v.id("folders")),
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

    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      isPublic: args.isPublic,
      parentFolderId: args.parentFolderId,
      organizationId: orgId,
      createdByUserId: userId,
    });

    return folderId;
  },
});
