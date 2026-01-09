import { ConvexError, v } from "convex/values";
import { action, mutation } from "../_generated/server.js";
import {
  mustGetIdentity,
  validateAccess,
} from "../utils/auth.js";
import getFileType from "../utils/getFileType.js";
import { api, internal } from "../_generated/api.js";
import { del } from "@vercel/blob";
import { useAction } from "convex/react";

export const saveMediaRecord = mutation({
  args: {
    name: v.string(),
    pathname: v.string(),
    url: v.string(),
    isPublic: v.optional(v.boolean()),
    size: v.number(),
    mimeType: v.string(),
    parentId: v.optional(v.id("media")),
    category: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    tags: v.array(v.string()),
    thumbnailUrl: v.optional(v.string()),
    isFileValid: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let position = 0;
    const { userId, orgId } = await mustGetIdentity(ctx);

    if (!args.isFileValid) {
      console.log("File is Invalid");
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "File is invalid",
      });
    }

    if (args.folderId) {
      const lastFile = await ctx.db
        .query("media")
        .withIndex("by_folder_position", (q) =>
          q.eq("folderId", args.folderId)
        )
        .order("desc")
        .first();

      position = lastFile ? lastFile.position! + 1 : 0;
    }

    const type = getFileType(args.mimeType);

    const mediaId = await ctx.db.insert("media", {
      name: args.name,
      pathname: args.pathname,
      url: args.url,
      isPublic: args.isPublic ?? false,
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
      thumbnailUrl: args.thumbnailUrl,
      position: position,
    });

    return {
      mediaId: mediaId,
      url: args.url,
    };
  },
});

export const updateMediaRecord = mutation({
  args: {
    id: v.id("media"), // The document ID is required
    name: v.optional(v.string()),
    pathname: v.optional(v.string()),
    url: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    parentId: v.optional(v.id("media")),
    isPublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    tags: v.optional(v.array(v.string())),
    thumbnailUrl: v.optional(v.string()),
    isFileUpdated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    console.log(args);
    if (!existing) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Media record not found",
      });
    }

    const { userId, orgId } = await mustGetIdentity(ctx);

    const valid = await validateAccess({
      ctx,
      userId: existing.userId,
      orgId: existing.organizationId,
    });

    if (!valid) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Access denied",
      });
    }

    // 3. Extract the ID and any fields that shouldn't be patched directly
    const { id, ...patchData } = args;

    // This ensures we only update fields that were provided
    const updatedData = {
      ...patchData,
      type:
        getFileType(args.mimeType || existing.mimeType) ||
        existing.type,
    };

    // 4. Update the record
    await ctx.db.patch(id, {
      ...updatedData,
      folderId: updatedData?.folderId || undefined,
    });

    return { success: true, mediaId: id };
  },
});

// export const deleteMediaRecord = mutation({
//   args: {
//     id: v.id("media"),
//   },
//   handler: async (ctx, args) => {
//     const file = await ctx.db.get(args.id);
//     if (!file) {
//       throw new ConvexError({
//         code: "NOT_FOUND",
//         message: "Media record not found",
//       });
//     }
//     const { userId, orgId } = await mustGetIdentity(ctx);
//     const valid = await validateAccess({
//       ctx,
//       userId: file.userId,
//       orgId: file.organizationId,
//     });
//     if (!valid) {
//       throw new ConvexError({
//         code: "UNAUTHORIZED",
//         message: "Access denied",
//       });
//     }

//     await ctx.db.delete(args.id);
//     return { success: true };
//   },
// });
export const removeMediaFromDb = mutation({
  args: {
    id: v.id("media"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Media record not found",
      });
    }
    const { userId, orgId } = await mustGetIdentity(ctx);
    const valid = await validateAccess({
      ctx,
      userId: file.userId,
      orgId: file.organizationId,
    });
    if (!valid) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Access denied",
      });
    }

    await ctx.db.delete(args.id);
    return {
      thumbnailUrl: file.thumbnailUrl,
      url: file.url,
    };
  },
});

export const deleteMediaRecord = action({
  args: {
    id: v.id("media"),
  },
  handler: async (ctx, args) => {
    const { userId, orgId } = await mustGetIdentity(ctx);
    // 1. Delete from DB first via Mutation
    // This ensures if the DB delete fails, we don't delete the physical file
    const fileData = await ctx.runMutation(
      api.main.media.removeMediaFromDb,
      {
        id: args.id,
      }
    );

    // 2. Delete from Vercel Blob
    const urlsToDelete = [];
    if (fileData.thumbnailUrl)
      urlsToDelete.push(fileData.thumbnailUrl);
    if (fileData.url) urlsToDelete.push(fileData.url);

    const data = await ctx.runQuery(
      internal.private.vercel.getVercelToken,
      {
        userId: userId,
        orgId: orgId,
      }
    );
    

    if (urlsToDelete.length > 0) {
      await del(urlsToDelete, {
        token: data?.vercelBlobReadWriteToken,
      });
    }

    return { success: true };
  },
});
