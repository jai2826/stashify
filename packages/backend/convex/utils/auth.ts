// convex/utils/auth.ts
import { ConvexError } from "convex/values";
import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "../_generated/server";

export async function mustGetIdentity(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Identity not found",
    });
  }

  const orgId = identity.orgId;
  if (!orgId) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  const userId = identity.subject;
  if (!userId) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return {
    identity,
    orgId: orgId as string,
    userId: userId as string,
  };
}
export async function validateAccess({
  ctx,
  orgId,
  userId,
}: {
  ctx: QueryCtx | MutationCtx | ActionCtx;
  orgId: string;
  userId: string;
}) {
  const identity = await ctx.auth.getUserIdentity();

  if (orgId !== identity?.orgId) {
    return false;
  } else if (userId !== identity?.userId) {
    return false;
  }

  return true;
}
