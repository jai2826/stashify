"use client";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectTrigger } from "@workspace/ui/components/select";

import { useState } from "react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated?: () => void;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onFolderCreated,
}: CreateFolderDialogProps) => {
  // const addFile = useAction(api.private.files.addFile);

  const [isCreating, setIsCreating] = useState(false);
  const [folderForm, setFolderForm] = useState({
    name: "",
    parentFolderId: undefined,
    isPublic: false,
  });

  const handleFolderCreate = () => {
    console.log("Create Folder clicked");
  };

  const handleUpload = async () => {
    console.log("Upload clicked");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFolderForm({
      name: "",
      parentFolderId: undefined,
      isPublic: false,
    });
  };

  const createFolder = () => {
    console.log("Create Folder clicked");
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      //TODO: Fix IT After USE
      open={true}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px]">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your media
            files.
          </DialogDescription>
        </DialogHeader>

        <div className="  md:grid md:grid-cols-2 gap-4 space-y-4">
          {/* Folder Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              className="w-full"
              id="name"
              onChange={(e) =>
                setFolderForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Summer Vacation 2022"
              type="text"
              value={folderForm.name}
            />
          </div>
          {/* Parent Folder */}
          <div className="space-y-2">
            <Label>Parent Folder</Label>
            <Select>
              <SelectTrigger className="w-full">
                Select a parent folder (optional)
              </SelectTrigger>
            </Select>
          </div>
          <div className="space-y-2  ">
            <Label>Is Public ?</Label>

            <div className="flex flex-col ">
              <Checkbox
                id="isPublic"
                className="size-6"
                checked={folderForm.isPublic}
                onCheckedChange={() => {
                  setFolderForm((prev) => ({
                    ...prev,
                    isPublic: !prev.isPublic,
                  }));
                }}
              />
              <span className="text-xs text-muted-foreground">
                Make folder public (anyone with the link can
                view)
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isCreating}
            onClick={handleCancel}
            variant={"outline"}>
            Cancel
          </Button>
          <Button
            disabled={isCreating}
            onClick={handleFolderCreate}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
