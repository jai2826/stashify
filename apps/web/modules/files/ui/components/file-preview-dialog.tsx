"use client";
import {
  FileToPreviewAtom,
  isFilePreviewOpen,
} from "@/modules/files/ui/atom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { VideoPlayer } from "@workspace/ui/modules/video-player";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  PlusCircleIcon,
  SaveIcon,
  XCircleIcon,
} from "lucide-react";
import { SearchableSelect } from "@workspace/ui/modules/searchable-select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";

export const FilePreviewDialog = () => {
  const [open, setOpen] = useAtom(isFilePreviewOpen);
  const file = useAtomValue(FileToPreviewAtom);
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        // setUploadedFiles([]);
      }}
      open={open}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px]">
        <DialogTitle>{file?.name}</DialogTitle>
        <div className="w-full border p-4">
          {file?.type === "image" && (
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
