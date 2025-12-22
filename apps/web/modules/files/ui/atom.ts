import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import { atom } from "jotai";

export const FileToPreviewAtom = atom<Doc<"media"> | null>(
  null
);
export const isFilePreviewOpen = atom<boolean>(false);