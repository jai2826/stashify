"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import { useAction } from "convex/react";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { api } from "@workspace/backend/convex/_generated/api.js";
import { PlusCircleIcon, PlusIcon } from "lucide-react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded?: () => void;
}

export const UploadDialog = ({
  open,
  onOpenChange,
  onFileUploaded,
}: UploadDialogProps) => {
  // const addFile = useAction(api.private.files.addFile);

  const [uploadedFiles, setUploadedFiles] = useState<
    File[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: "",
    filename: "",
    tags: "",
  });

  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFiles([file]);
      if (!uploadForm.filename) {
        setUploadForm((prev) => ({
          ...prev,
          filename: file.name,
        }));
      }
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const blob = uploadedFiles[0];
      if (!blob) {
        return;
      }

      const filename = uploadForm.filename || blob.name;
      // await addFile({
      //   bytes: await blob.arrayBuffer(),
      //   filename,
      //   mimetype: blob.type || "text/plain",
      //   category: uploadForm.category,
      // });

      onFileUploaded?.();
      handleCancel();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUploadedFiles([]);
    setUploadForm({ category: "", filename: "", tags: "" });
  };

  const createFolder = () => {
    console.log("Create Folder clicked");
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      //TODO: Fix IT After USE
      open={open}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload your media files here,
          </DialogDescription>
        </DialogHeader>

        <div className="  md:grid md:grid-cols-2 gap-4 space-y-4">
          {/* FileName */}
          <div className="space-y-2">
            <Label>
              Filename
              {/* <span className="text-muted-foreground text-sm">
                (optional)
              </span> */}
              {/* <span className="text-muted-foreground text-sm ml-auto">
                Include file extension (e.g. .pdf, .txt)
              </span> */}
            </Label>
            <Input
              className="w-full"
              id="filename"
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  filename: e.target.value,
                }))
              }
              placeholder="Override default filename"
              type="text"
              value={uploadForm.filename}
            />
          </div>
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              className="w-full"
              id="category"
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              placeholder="e.g. Documentation, Support, Product"
              type="text"
              value={uploadForm.category}
            />
          </div>
          {/* Tags */}
          <div className="space-y-2">
            <Label>
              Tags
              <span className="text-muted-foreground text-sm">
                (Separate with commas)
              </span>
            </Label>
            <Input
              className="w-full"
              id="tags"
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  tags: e.target.value,
                }))
              }
              placeholder="e.g. Documentation, Support, Product"
              type="text"
              value={uploadForm.tags}
            />
          </div>
          {/* Folder */}
          {/* Space in y is 1 beacuse button is taking more height than the */}
          <div className="space-y-1">
            <Label>
              Folder
              
              <Button
                onClick={createFolder}
                className="text-xs ml-auto "
                size={"xs"}>
                <PlusCircleIcon />
                Create
              </Button>
            </Label>
            <Input
              className="w-full"
              id="tags"
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  tags: e.target.value,
                }))
              }
              placeholder="e.g. Documentation, Support, Product"
              type="text"
              value={uploadForm.tags}
            />
          </div>

          <Dropzone
            accept={{
              // Images
              "image/jpeg": [],
              "image/png": [],
              "image/webp": [],
              // GIFs
              "image/gif": [],
              // Videos
              "video/mp4": [],
              "video/webm": [],
              "video/ogg": [],
              "video/quicktime": [], // For .mov files
            }}
            disabled={isUploading}
            maxSize={500 * 1024 * 1024} // 500 MB
            maxFiles={1}
            onDrop={handleFileDrop}
            src={uploadedFiles}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        <DialogFooter>
          <Button
            disabled={isUploading}
            onClick={handleCancel}
            variant={"outline"}>
            Cancel
          </Button>
          <Button
            disabled={
              isUploading ||
              uploadedFiles.length === 0 ||
              !uploadForm.category
            }
            onClick={handleUpload}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
