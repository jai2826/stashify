"use client";
import {
  createFolderDialogOpenAtom,
  uploadFolderIdAtom,
} from "@workspace/ui/lib/atoms";
import { useSetAtom } from "jotai";

export function useCreateFolderModal() {
  const setOpen = useSetAtom(createFolderDialogOpenAtom);
  const setFolderId = useSetAtom(uploadFolderIdAtom);

  const openCreateFolder = (folderId?: string) => {
    if (folderId) setFolderId(folderId);
    setOpen(true);
  };

  return { openCreateFolder };
}
