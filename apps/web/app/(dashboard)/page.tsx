"use client";
import { Button } from "@workspace/ui/components/button";
import { useUploadModal } from "@workspace/ui/hooks/use-upload-modal";
import { useCreateFolderModal } from "@workspace/ui/hooks/use-create-folder-modal";
import { PlusIcon } from "lucide-react";

export default function Page() {
  const { openUpload } = useUploadModal();
  const {openCreateFolder} = useCreateFolderModal();
  return (
    <>
      <div className="flex flex-col  items-center justify-center min-h-svh">
        <Button onClick={() => openUpload()}>
          <PlusIcon />
          Add New
        </Button>
        <Button
          onClick={() => openCreateFolder()}>
          <PlusIcon />
          Create Folder
        </Button>
      </div>
    </>
  );
}
