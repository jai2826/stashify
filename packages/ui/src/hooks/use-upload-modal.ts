'use client'
import { useSetAtom } from "jotai";
import { uploadDialogOpenAtom, uploadFolderIdAtom } from "@workspace/ui/lib/atoms";

export function useUploadModal() {
 
  const setOpen = useSetAtom(uploadDialogOpenAtom);
  const setFolderId = useSetAtom(uploadFolderIdAtom);

  const openUpload = (folderId?: string) => {
    if (folderId) setFolderId(folderId);
    setOpen(true);
  };

  return { openUpload };
}