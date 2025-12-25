"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/convex/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
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
import { useMutation, useQuery } from "convex/react";

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
import {
  createFolderDialogOpenAtom,
  uploadDialogOpenAtom,
} from "@workspace/ui/lib/atoms";
import { SearchableSelect } from "@workspace/ui/modules/searchable-select";
import { useAtom, useSetAtom } from "jotai";
import {
  LucideMessageCircleQuestion,
  PlusCircleIcon,
  SaveIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useClientIdentity } from "@workspace/ui/hooks/use-clerk-identity";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { generateThumbnail as createThumbnail } from "@workspace/ui/lib/video-util";

const MediaSchema = z.object({
  name: z.string().min(1, "File name is required"),
  category: z.string().optional(),
  folderId: z.string().optional(),
  isPublic: z.boolean(),
  tags: z.string().optional(),
  file: z.boolean(),
  thumbnailFile: z.boolean().optional(),
});

export const UploadDialog = () => {
  const [open, setOpen] = useAtom(uploadDialogOpenAtom);
  const { userId, orgId } = useClientIdentity();
  const [generateThumbnail, setGenerateThumbnail] =
    useState(false);
  const [
    uploadedThumbnailFiles,
    setUploadedThumbnailFiles,
  ] = useState<File[]>([]);
  const setCreateFolderDialogOpen = useSetAtom(
    createFolderDialogOpenAtom
  );

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
      folderId: undefined,
      isPublic: false,
      tags: "",
      file: false,
      thumbnailFile: false,
    },
  });

  const saveMediaRecord = useMutation(
    api.main.media.saveMediaRecord
  ); // Your existing mutation

  const onSubmit = async (
    data: z.infer<typeof MediaSchema>
  ) => {
    if (!uploadedFiles[0]) return;
    console.log(data);

    const structuredPathname = (filename: string) => {
      return `${userId}/${orgId}/media/${filename}`;
    };
    try {
      let thumbUrl = undefined;
      // Case A: Generate from Video
      if (isVideo && generateThumbnail) {
        const thumbBlob = await createThumbnail(
          uploadedFiles[0]
        );
        const thumbFile = new File(
          [thumbBlob],
          `${uploadedFiles[0].name}_thumbnail.jpg`,
          { type: "image/jpeg" }
        );
        const result = await upload(
          structuredPathname(thumbFile.name),
          thumbFile,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
          }
        );
        thumbUrl = result.url;
      }
      // Case B: Use Manually Uploaded Thumbnail
      else if (isVideo && uploadedThumbnailFiles[0]) {
        const result = await upload(
          structuredPathname(
            uploadedThumbnailFiles[0].name
          ),
          uploadedThumbnailFiles[0],
          {
            access: "public",
            handleUploadUrl: "/api/upload",
          }
        );
        thumbUrl = result.url;
      }

      const blob = await upload(
        structuredPathname(
          data.name ?? uploadedFiles[0].name
        ),
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
        folderId: data?.folderId
          ? (data.folderId as Id<"folders">)
          : undefined,
        category: data.category,
        thumbnailUrl: thumbUrl,
        isFileValid: data.file,
        isPublic: data.isPublic,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim())
          : [],
      });

      setUploadedFiles([]);
      toast.success("Media uploaded and saved!");
      setOpen(false);
      form.reset();
    } catch (error) {
      setUploadedFiles([]);
      console.error(error);
      toast.error("Upload failed!!");
    }
  };

  const handleCancel = () => {
    form.reset();
    setUploadedFiles([]);
    setOpen(false);
  };
  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFiles([file]);

      // Auto-fill name if empty
      if (!form.getValues("name")) {
        form.setValue("name", file.name);
      }
      form.setValue("file", true);
      setDisabled(false);

      // LOGIC FIX: Reset thumbnail states if the new file is NOT a video
      if (!file.type.startsWith("video/")) {
        setGenerateThumbnail(false);
        setUploadedThumbnailFiles([]);
        form.setValue("thumbnailFile", false);
      } else {
        setGenerateThumbnail(true);
      }
    } else {
      form.setValue("file", false);
      setDisabled(true);
      setUploadedFiles([]);
      setGenerateThumbnail(false);
    }
  };

  const handleThumbnailFileDrop = (
    acceptedFiles: File[]
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedThumbnailFiles([file]);
      setGenerateThumbnail(false);
      form.setValue("thumbnailFile", true);
      setDisabled(false);
    } else {
      form.setValue("thumbnailFile", false);
      setDisabled(true);
      setUploadedThumbnailFiles([]);
    }
  };

  // Inside UploadDialog component
  const stagedFile = uploadedFiles[0];
  // Only show video options if the dropped file exists and is a video
  const isVideo =
    !!stagedFile && stagedFile.type.startsWith("video/");

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
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
                          setCreateFolderDialogOpen?.(true)
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
                  /* We remove space-y-2 and add self-start to pin it to the top of the grid cell */
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 self-start">
                    <FormControl>
                      <Checkbox
                        id="isPublic"
                        className="size-5 border-gray-300"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is Public ?</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div>
                {/* tempSpane */}
                </div>
              {/* File */}
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex justify-between">
                      Dropzone
                    </FormLabel>
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
              {/* Thumbnail Dropzone */}
              {isVideo && (
                <FormField
                  control={form.control}
                  name="thumbnailFile"
                  render={({ field }) => (
                    <FormItem className="space-y-2 h-fit">
                      <FormLabel className="flex justify-between h-fit">
                        Thumbnail Dropzone
                        {/* <span className="flex items-center gap-x-1">
                          <Checkbox
                            disabled={
                              form.formState.isSubmitting
                            }
                            checked={generateThumbnail}
                            className="border-2 border-primary"
                            onCheckedChange={(
                              e: boolean
                            ) => {
                              setGenerateThumbnail(e);
                              if (e)
                                form.setValue(
                                  "thumbnailFile",
                                  !e
                                );
                              setUploadedThumbnailFiles([]);
                            }}
                          />
                          Generate Thumbnail
                          <Tooltip>
                            <TooltipTrigger>
                              <LucideMessageCircleQuestion
                                size={16}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[60vw] text-xs font-medium  ">
                              <p>
                                If you uploaded the new
                                thumbnail file, and want to
                                use that as the thumbnail
                                for the video, please
                                uncheck this box.
                              </p>
                              <p>
                                If you want us to generate a
                                new thumbnail from the
                                video, please check this
                                box. Old thumbnail or
                                thumbnail uploaded will be
                                ignored.
                              </p>
                              <p>
                                Note: This only applies to
                                video files. and will be
                                available only when a video
                                file is uploaded.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </span> */}
                      </FormLabel>
                      <FormControl>
                        <Dropzone
                          className="w-full"
                          accept={{
                            // Images
                            "image/jpeg": [],
                            "image/png": [],
                            "image/webp": [],
                          }}
                          disabled={
                            form.formState.isSubmitting
                          }
                          maxFiles={1}
                          maxSize={500 * 1024 * 1024} // 500 MB
                          onDrop={handleThumbnailFileDrop}
                          src={uploadedThumbnailFiles}>
                          <DropzoneEmptyState />
                          <DropzoneContent />
                        </Dropzone>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                  disabled || form.formState.isSubmitting
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
