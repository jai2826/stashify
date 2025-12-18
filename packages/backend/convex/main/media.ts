import { ConvexError, v } from "convex/values";
import getFileType from "../../utils/getFileType.js";
import { internalMutation } from "../_generated/server.js";

export const saveMediaRecord = internalMutation({
  args: {
    name: v.string(),
    pathname: v.string(),
    url: v.string(),
    size: v.number(),
    mimeType: v.string(),
    parentId: v.optional(v.id("media")),
    category: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    tags: v.array(v.string()),
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

    const type = getFileType(args.mimeType);

    const mediaId = await ctx.db.insert("media", {
      name: args.name,
      pathname: args.pathname,
      url: args.url,
      size: args.size,
      mimeType: args.mimeType,
      parentId: args.parentId,
      category: args.category,
      folderId: args.folderId,
      tags: args.tags,
      type: type,
      organizationId: orgId,
      userId: userId,
      isModerated: false,
      isOptimized: false,
      originalUrl: args.url,
    });

    return {
      mediaId: mediaId,
      url: args.url,
    };
  },
});
