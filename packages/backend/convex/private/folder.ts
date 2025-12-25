import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  mustGetIdentity,
  validateAccess,
} from "../utils/auth";

export const createFolder = mutation({
  args: {
    name: v.string(),
    isPublic: v.boolean(),
    parentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const { userId, orgId } = await mustGetIdentity(ctx);

    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      isPublic: args.isPublic,
      parentFolderId: args.parentFolderId,
      organizationId: orgId as string,
      userId: userId as string,
    });

    return folderId;
  },
});

export const getFoldersByOrganizationAndUser = query({
  args: {
    userId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, orgId } = await mustGetIdentity(ctx);

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_organization_user", (q) =>
        q
          .eq(
            "organizationId",
            args.organizationId ?? orgId
          )
          .eq("userId", args.userId ?? userId)
      )
      .collect();

    return folders;
  },
});

export const getFolderByIdWithFiles = query({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Folder not found",
      });
    }
    const files = await ctx.db
      .query("media")
      .withIndex("by_folder", (q) =>
        q.eq("folderId", args.folderId)
      )
      .collect();

    return { folder, files };
  },
});

export const updateFolder = mutation({
  args: {
    id: v.id("folders"),
    name: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    parentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const { userId, orgId } = await mustGetIdentity(ctx);
    const valid = await validateAccess({
      ctx,
      userId,
      orgId,
    });
    if (!valid) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Access denied",
      });
    }
    const folder = await ctx.db.get(args.id);
    if (!folder) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Folder not found",
      });
    }

    if (folder.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Access denied",
      });
    }

    const { id, ...patchData } = args;

    const updateFolderId = await ctx.db.patch(id, {
      ...patchData,
      parentFolderId:
        patchData?.parentFolderId || undefined,
    });
    return updateFolderId;
  },
});
// convex/folders.ts
export const listFoldersWithPreviews = query({
  handler: async (ctx, args) => {
    const { userId, orgId } = await mustGetIdentity(ctx);

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", orgId).eq("userId", userId)
      )
      .collect();

    // For each folder, fetch the top 4 images/videos to show in the preview
    const foldersWithFiles = await Promise.all(
      folders.map(async (folder) => {
        const previewFiles = await ctx.db
          .query("media")
          .withIndex("by_folder_position", (q) =>
            q.eq("folderId", folder._id)
          )
          .order("desc")
          .take(4);

        return { ...folder, previewFiles };
      })
    );
    return foldersWithFiles;
  },
});
