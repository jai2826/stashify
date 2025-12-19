"use client";
import {
  OrganizationSwitcher,
  UserButton,
} from "@clerk/nextjs";
import { useState } from "react";
import { UploadDialog } from "@workspace/ui/modules/upload-dialog";
import { CreateFolderDialog } from "@workspace/ui/modules/create-folder-dialog";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";

export default function Page() {
  const [uploadDialogOpen, setUploadDialogOpen] =
    useState(false);
  const [
    createFolderDialogOpen,
    setCreateFolderDialogOpen,
  ] = useState(false);
  return (
    <>
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        openCreateFolderDialog={createFolderDialogOpen}
        onOpenCreateFolderDialogChange={
          setCreateFolderDialogOpen
        }
      />
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
      />
      <div className="flex flex-col  items-center justify-center min-h-svh">
        <Button onClick={() => setUploadDialogOpen(true)}>
          <PlusIcon />
          Add New
        </Button>
        <Button
          onClick={() => setCreateFolderDialogOpen(true)}>
          <PlusIcon />
          Create Folder
        </Button>
      </div>
    </>
  );
}
