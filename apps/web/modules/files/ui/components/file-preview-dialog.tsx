"use client";
import {
  FileToPreviewAtom,
  isFilePreviewOpen,
} from "@/modules/files/ui/atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@vercel/blob/client";
import { api } from "@workspace/backend/convex/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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
import { Input } from "@workspace/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useClientIdentity } from "@workspace/ui/hooks/use-clerk-identity";
import { createFolderDialogOpenAtom } from "@workspace/ui/lib/atoms";
import { generateThumbnail as createThumbnail } from "@workspace/ui/lib/video-util";
import { SearchableSelect } from "@workspace/ui/modules/searchable-select";
import { VideoPlayer } from "@workspace/ui/modules/video-player";
import { useMutation, useQuery } from "convex/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  LucideMessageCircleQuestion,
  PlusCircleIcon,
  SaveIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const MediaSchema = z.object({
  name: z.string().min(1, "File name is required"),
  category: z.string().optional(),
  folderId: z.string().optional(),
  isPublic: z.boolean(),
  tags: z.string().optional(),
  // Change these to optional booleans to avoid strict validation blocks
  file: z.boolean().optional(),
  thumbnailFile: z.boolean().optional(),
});

export const FilePreviewDialog = () => {
  const file = useAtomValue(FileToPreviewAtom);
  const { userId, orgId } = useClientIdentity();
  const [open, setOpen] = useAtom(isFilePreviewOpen);
  const setCreateFolderDialogOpen = useSetAtom(
    createFolderDialogOpenAtom
  );
  const [generateThumbnail, setGenerateThumbnail] =
    useState(false);
  const [
    uploadedThumbnailFiles,
    setUploadedThumbnailFiles,
  ] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    File[]
  >([]);
  const existingFolders = useQuery(
    api.private.folder.getFoldersByOrganizationAndUser,
    {}
  );

  const form = useForm<z.infer<typeof MediaSchema>>({
    resolver: zodResolver(MediaSchema),
    defaultValues: {
      name: file?.name || "",
      category: file?.category || "",
      folderId: file?.folderId || "",
      isPublic: file?.isPublic,
      tags: file?.tags.join(", ") || "",
      thumbnailFile: false,
      file: false,
    },
  });

  useEffect(() => {
    if (file) {
      form.reset({
        name: file.name || "",
        category: file.category || "",
        folderId: file.folderId || undefined,
        isPublic: file.isPublic,
        tags: file.tags?.join(", ") || "",
        file: false,
        thumbnailFile: false,
      });
    }
    console.log(file?.isPublic);
  }, [file, form]);

  const updateMediaRecord = useMutation(
    api.main.media.updateMediaRecord
  );

  const onSubmit = async (
    data: z.infer<typeof MediaSchema>
  ) => {
    const structuredPathname = (filename: string) => {
      return `${userId}/${orgId}/media/${filename}`;
    };
    console.log(data.folderId);
    try {
      let thumbUrl = undefined;
      if (
        uploadedFiles[0] &&
        uploadedFiles[0]!.type.startsWith("video/") &&
        generateThumbnail
      ) {
        const thumbBlob = await createThumbnail(
          uploadedFiles[0]
        );
        const thumbFile = new File(
          [thumbBlob],
          `${uploadedFiles[0].name}_thumbnail.jpg`,
          { type: "image/jpeg" }
        );

        // Upload thumbnail to Vercel Blob
        const thumbResult = await upload(
          structuredPathname(thumbFile.name),
          thumbFile,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
          }
        );
        thumbUrl = thumbResult.url;
      }
      if (uploadedThumbnailFiles[0] && !generateThumbnail) {
        console.log("HEllo Harry");
        const thumbFile = new File(
          [uploadedThumbnailFiles[0]],
          `${uploadedThumbnailFiles[0].name}_thumbnail.jpg`,
          { type: uploadedThumbnailFiles[0].type }
        );
        const thumbResult = await upload(
          structuredPathname(thumbFile.name),
          thumbFile,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
          }
        );
        thumbUrl = thumbResult.url;
      }

      // 1. UPLOAD FILE: Browser -> Vercel Blob
      let blob: any = undefined;
      if (uploadedFiles[0]) {
        blob = await upload(
          structuredPathname(
            data.name ?? uploadedFiles[0]!!!.name
          ),
          uploadedFiles[0]!,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
          }
        );
      }

      // 2. SAVE METADATA: Browser -> Convex
      await updateMediaRecord({
        id: file?._id!,
        name: data.name,
        category: data.category,
        isPublic: data.isPublic,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim())
          : [],

        folderId:
          data.folderId === "none"
            ? undefined
            : (data.folderId as Id<"folders">),
        url: blob?.url,
        thumbnailUrl: thumbUrl,
        mimeType: uploadedFiles[0]?.type,
        size: uploadedFiles[0]?.size,
      });

      setUploadedFiles([]);
      setUploadedThumbnailFiles([]);
      toast.success("Media updated and saved!");
      form.reset();
      setOpen(false);
    } catch (error) {
      setUploadedFiles([]);
      setUploadedThumbnailFiles([]);
      console.error(error);
      toast.error("Update failed!!");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setUploadedFiles([]);
    setUploadedThumbnailFiles([]);
    setGenerateThumbnail(false);
    form.reset();
  };
  const handleFileDrop = (acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setUploadedFiles([newFile]);
      // This tells the form "hey, something changed!"
      form.setValue("file", true, { shouldDirty: true });

      if (newFile.type.startsWith("video/")) {
        setGenerateThumbnail(true);
      } else {
        setGenerateThumbnail(false);
        setUploadedThumbnailFiles([]);
        form.setValue("thumbnailFile", false, {
          shouldDirty: true,
        });
      }
    }
  };

  const handleThumbnailFileDrop = (
    acceptedFiles: File[]
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedThumbnailFiles([file]);
      setGenerateThumbnail(false);
      // Again, ensure the form knows it's now dirty
      form.setValue("thumbnailFile", true, {
        shouldDirty: true,
      });
    }
  };

  // 1. Determine the "Current" type of the file being handled
  const stagedFile = uploadedFiles[0];
  const currentFileType = stagedFile
    ? stagedFile.type.startsWith("video/")
      ? "video"
      : "image"
    : file?.type;

  // 2. Use this for your conditional rendering
  const isVideo = currentFileType === "video";

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        setUploadedFiles([]);
      }}
      open={open}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px] max-h-[90vh] overflow-y-auto ">
        <DialogTitle>{file?.name}</DialogTitle>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit,
              (errors) =>
                console.log("Validation Errors:", errors)
            )}>
            <div className="my-4 md:grid md:grid-cols-2 gap-4 space-y-4">
              <div className="w-full border p-2 rounded-md">
                {(file?.type === "image" ||
                  file?.type === "gif") && (
                  <ImagePreview
                    src={file?.url ?? ""}
                    alt={file?.name ?? "File Preview"}
                  />
                )}
                {file?.type === "video" && (
                  <VideoPlayer
                    url={file.url ?? ""}
                    poster={file.thumbnailUrl}
                  />
                )}
              </div>
              {/* Media Data */}
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

              {/* Folder */}
              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
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

              {/* Thumbnail Dropzone */}
              {isVideo && (
                <FormField
                  control={form.control}
                  name="thumbnailFile"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex justify-between">
                        Thumbnail Dropzone
                        <span className="flex items-center space-x-1">
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
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Dropzone
                          className="w-2/3"
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
                  !form.formState.isDirty ||
                  form.formState.isSubmitting
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

const ImagePreview = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
      <Image
        loading="lazy"
        alt={alt}
        src={src}
        width={200}
        height={120}
        className="h-full w-auto object-contain"
      />
    </div>
  );
};
