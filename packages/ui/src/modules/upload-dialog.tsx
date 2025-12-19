"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/convex/_generated/api";
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
import {
  useMutation,
  useQuery
} from "convex/react";

import { upload } from "@vercel/blob/client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { SearchableSelect } from "@workspace/ui/modules/searchable-select";
import {
  PlusCircleIcon,
  SaveIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded?: () => void;

  openCreateFolderDialog?: boolean;
  onOpenCreateFolderDialogChange?: (open: boolean) => void;
  onCreateFolderCompleted?: (
    openCreateFolderDialog: boolean,
    open: boolean
  ) => void;
}

const MediaSchema = z.object({
  name: z.string().min(1, "File name is required"),
  category: z.string().optional(),
  folderId: z.string().optional(),
  isPublic: z.boolean(),
  tags: z.string().optional(),
  file: z.boolean(),
});

export const UploadDialog = ({
  open,
  onOpenChange,
  onFileUploaded,
  openCreateFolderDialog,
  onOpenCreateFolderDialogChange,
  onCreateFolderCompleted,
}: UploadDialogProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<
    File[]
  >([]);
  const [disabled, setDisabled] = useState(true);
  const existingFolders = useQuery(
    api.private.folder.getFoldersByOrganizationAndUser,
    {}
  );

  const form = useForm<z.infer<typeof MediaSchema>>({
    resolver: zodResolver(MediaSchema),
    defaultValues: {
      name: "",
      category: "",
      folderId: "",
      isPublic: false,
      tags: "",
      file: false,
    },
  });

  
  const saveMediaRecord = useMutation(
    api.main.media.saveMediaRecord
  ); // Your existing mutation

  const onSubmit = async (
    data: z.infer<typeof MediaSchema>
  ) => {
    if (!uploadedFiles[0]) return;

    try {
      const blob = await upload(
        data.name ?? uploadedFiles[0].name,
        uploadedFiles[0],
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      // 2. SAVE METADATA: Browser -> Convex
      await saveMediaRecord({
        url: blob.url,
        pathname: blob.pathname,
        name: data.name,
        mimeType: uploadedFiles[0].type,
        size: uploadedFiles[0].size,
        folderId: data.folderId as any,
        category: data.category,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim())
          : [],
      });

      setUploadedFiles([]);
      toast.success("Media uploaded and saved!");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      setUploadedFiles([]);
      console.error(error);
      toast.error("Upload failed!!");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUploadedFiles([]);
    form.reset();
  };
  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFiles([file]);
      if (!form.getValues("name")) {
        form.setValue("name", file.name);
      }
      form.setValue("file", true);
      setDisabled(false);
    } else {
      form.setValue("file", false);
      setDisabled(true);
      setUploadedFiles([]);
    }
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        setUploadedFiles([]);
      }}
      open={open}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Upload your media files here. You can
                organize them into folders and set their
                visibility.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 md:grid md:grid-cols-2 gap-4 space-y-4">
              {/* Media Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full"
                        placeholder="e.g. Video File 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Folder */}
              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
                  // TODO:Fix spacing
                  <FormItem className="space-y-0">
                    <FormLabel>
                      Folder
                      <Button
                        onClick={() =>
                          onOpenCreateFolderDialogChange?.(
                            true
                          )
                        }
                        type="button"
                        className="text-xs ml-auto cursor-pointer hover:opacity-90"
                        size={"icon-xs"}>
                        <PlusCircleIcon />
                      </Button>
                    </FormLabel>

                    <SearchableSelect
                      options={
                        existingFolders?.map(
                          (folder: any) => ({
                            label: folder.name,
                            value: folder._id,
                          })
                        ) ?? []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Parent Folder"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full"
                        placeholder="e.g. Education, Entertainment, etc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>
                      Tags
                      <p className="text-muted-foreground/50">
                        (Separate with commas)
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full"
                        placeholder="e.g. youtube, tutorial, music"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Is Public */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Is Public ?</FormLabel>
                    <FormControl>
                      <Checkbox
                        id="isPublic"
                        className="size-6"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* File */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Dropzone</FormLabel>
                    <FormControl>
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
                        disabled={
                          form.formState.isSubmitting
                        }
                        maxFiles={1}
                        maxSize={500 * 1024 * 1024} // 500 MB
                        onDrop={handleFileDrop}
                        src={uploadedFiles}>
                        <DropzoneEmptyState />
                        <DropzoneContent />
                      </Dropzone>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={form.formState.isSubmitting}
                onClick={handleCancel}
                type="button"
                variant={"outline"}>
                <XCircleIcon />
                Cancel
              </Button>
              <Button
                disabled={
                  disabled ?? form.formState.isSubmitting
                }
                className="hover:opacity-80"
                type="submit">
                <SaveIcon />
                {form.formState.isSubmitting
                  ? "Saving..."
                  : "Save File"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
