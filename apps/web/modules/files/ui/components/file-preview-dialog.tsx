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
import {
  useAction,
  useMutation,
  useQuery,
} from "convex/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  CopyIcon,
  Loader2,
  LucideMessageCircleQuestion,
  PlusCircleIcon,
  SaveIcon,
  TrashIcon,
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

  const [isDeleting, setIsDeleting] = useState(false);
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
  const updateMediaRecord = useMutation(
    api.main.media.updateMediaRecord
  );
  const deleteMediaRecord = useAction(
    api.main.media.deleteMediaRecord
  );

  const form = useForm<z.infer<typeof MediaSchema>>({
    resolver: zodResolver(MediaSchema),
    defaultValues: {
      name: "",
      category: "",
      folderId: "",
      isPublic: false,
      tags: "",
      thumbnailFile: false,
      file: false,
    },
  });

  const pending = form.formState.isSubmitting || isDeleting;

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
  }, [file, form]);

  const onSubmit = async (
    data: z.infer<typeof MediaSchema>
  ) => {
    const structuredPathname = (filename: string) =>
      `${userId}/${orgId}/media/${filename}`;
    try {
      let thumbUrl = undefined;
      if (
        uploadedFiles[0]?.type.startsWith("video/") &&
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
        const thumbResult = await upload(
          structuredPathname(thumbFile.name),
          thumbFile,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
            clientPayload: JSON.stringify({
              userId: userId,
              orgId: orgId,
            }),
          }
        );
        thumbUrl = thumbResult.url;
      }
      if (uploadedThumbnailFiles[0] && !generateThumbnail) {
        const thumbResult = await upload(
          structuredPathname(
            uploadedThumbnailFiles[0].name
          ),
          uploadedThumbnailFiles[0],
          {
            access: "public",
            handleUploadUrl: "/api/upload",
            clientPayload: JSON.stringify({
              userId: userId,
              orgId: orgId,
            }),
          }
        );
        thumbUrl = thumbResult.url;
      }

      let blob: any = undefined;
      if (uploadedFiles[0]) {
        blob = await upload(
          structuredPathname(
            data.name ?? uploadedFiles[0].name
          ),
          uploadedFiles[0],
          {
            access: "public",
            handleUploadUrl: "/api/upload",
            clientPayload: JSON.stringify({
              userId: userId,
              orgId: orgId,
            }),
          }
        );
      }

      await updateMediaRecord({
        id: file?._id!,
        name: data.name,
        category: data.category,
        isPublic: data.isPublic,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim())
          : [],
        folderId:
          data.folderId === "none" || !data.folderId
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
      setOpen(false);
      form.reset();
    } catch (error) {
      setUploadedFiles([]);
      setUploadedThumbnailFiles([]);
      console.error(error);
      toast.error("Update failed!!");
    }
  };

  const handleCancel = () => {
    if (pending) return;
    setOpen(false);
    setUploadedFiles([]);
    setUploadedThumbnailFiles([]);
    setGenerateThumbnail(false);
    form.reset();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMediaRecord({
        id: file?._id!,
      });
      setUploadedFiles([]);
      setUploadedThumbnailFiles([]);
      if (result.success) {
        toast.success("File deleted!");
        setOpen(false);
      } else {
        toast.error("Failed to delete file!");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const stagedFile = uploadedFiles[0];
  const currentFileType = stagedFile
    ? stagedFile.type.startsWith("video/")
      ? "video"
      : "image"
    : file?.type;

  const isVideo = currentFileType === "video";

  const handleCopy = async () => {
    if (!file?._id) return;
    try {
      await navigator.clipboard.writeText(file._id);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog
      onOpenChange={(io) => !pending && setOpen(io)}
      open={open}>
      <DialogContent className="flex-1 md:min-w-[calc(100vw-3rem)] lg:min-w-[900px] max-h-[90vh] overflow-y-auto ">
        <DialogTitle className="flex justify-between items-center mr-4 mt-2">
          <div className="flex flex-col md:flex-row items-start gap-3 text-2xl font-semibold w-full">
            {file?.name}

            <div className="flex gap-2">
              <Input
                value={file?._id}
                disabled={true}
                className=" w-40 md:w-fit"
              />

              <Button
                onClick={handleCopy}
                type="button"
                value={file?._id}
                variant="default"
                size="icon">
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            disabled={pending}
            variant="destructive"
            onClick={handleDelete}>
            {isDeleting ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              <TrashIcon />
            )}
            Delete
          </Button>
        </DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={pending}
              className="space-y-4">
              <div className="my-4 md:grid md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
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

                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem className="space-y-2">
                      <FormLabel>Dropzone</FormLabel>
                      <FormControl>
                        <Dropzone
                          disabled={pending}
                          maxFiles={1}
                          maxSize={500 * 1024 * 1024}
                          onDrop={(files) => {
                            const f = files[0];
                            if (f) {
                              setUploadedFiles([f]);
                              form.setValue("file", true, {
                                shouldDirty: true,
                              });
                              setGenerateThumbnail(
                                f.type.startsWith("video/")
                              );
                            }
                          }}
                          src={uploadedFiles}>
                          <DropzoneEmptyState />
                          <DropzoneContent />
                        </Dropzone>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="e.g. Education"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>
                        Tags{" "}
                        <span className="text-muted-foreground/50 text-xs">
                          (Commas)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="e.g. tutorial, music"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="folderId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="flex items-center">
                        Folder
                        <Button
                          onClick={() =>
                            setCreateFolderDialogOpen(true)
                          }
                          type="button"
                          disabled={pending}
                          className="text-xs ml-auto cursor-pointer"
                          size="icon-xs">
                          <PlusCircleIcon />
                        </Button>
                      </FormLabel>
                      <SearchableSelect
                        options={
                          existingFolders?.map(
                            (f: any) => ({
                              label: f.name,
                              value: f._id,
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

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 self-start">
                      <FormControl>
                        <Checkbox
                          className="size-5"
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

                {isVideo && (
                  <FormField
                    control={form.control}
                    name="thumbnailFile"
                    render={() => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex justify-between items-center">
                          Thumbnail
                          <span className="flex items-center space-x-1">
                            <Checkbox
                              checked={generateThumbnail}
                              onCheckedChange={(
                                e: boolean
                              ) => {
                                setGenerateThumbnail(e);
                                if (e) {
                                  setUploadedThumbnailFiles(
                                    []
                                  );
                                  form.setValue(
                                    "thumbnailFile",
                                    false
                                  );
                                }
                              }}
                            />
                            <span className="text-xs">
                              Generate
                            </span>
                            <Tooltip>
                              <TooltipTrigger type="button">
                                <LucideMessageCircleQuestion
                                  size={14}
                                />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px] text-xs">
                                <p>
                                  Enable to auto-generate
                                  thumbnail from video
                                  upload.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Dropzone
                            className="w-full h-32"
                            disabled={
                              pending || generateThumbnail
                            }
                            maxFiles={1}
                            onDrop={(files) => {
                              if (files[0]) {
                                setUploadedThumbnailFiles(
                                  files
                                );
                                setGenerateThumbnail(false);
                                form.setValue(
                                  "thumbnailFile",
                                  true,
                                  { shouldDirty: true }
                                );
                              }
                            }}
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
            </fieldset>

            <DialogFooter className="mt-6">
              <Button
                disabled={pending}
                onClick={handleCancel}
                type="button"
                variant="outline">
                <XCircleIcon />
                Cancel
              </Button>
              <Button
                disabled={
                  !form.formState.isDirty || pending
                }
                type="submit">
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  <SaveIcon />
                )}
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

export const ImagePreview = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => (
  <div className="w-full aspect-video flex items-center justify-center bg-muted/30 rounded-md overflow-hidden relative">
    <Image
      loading="lazy"
      alt={alt}
      src={src}
      fill
      className="object-contain"
    />
  </div>
);
