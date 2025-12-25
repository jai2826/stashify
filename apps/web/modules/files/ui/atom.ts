import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import { atom } from "jotai";

// File Atoms
export const FileToPreviewAtom = atom<Doc<"media"> | null>(
  null
);
export const isFilePreviewOpen = atom<boolean>(false);


// Folder Atoms
export const FolderToPreviewAtom =
  atom<Doc<"folders"> | null>(null);

export const isFolderPreviewOpen = atom<boolean>(false);
