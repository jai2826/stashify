"use client";
import {
  FolderToPreviewAtom,
  isFolderPreviewOpen,
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const FolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .optional(),
  isPublic: z.boolean().optional(),
  parentFolderId: z.string().optional(),
});

export const FoldePreviewDialog = () => {
  const folder = useAtomValue(FolderToPreviewAtom);
  const { userId, orgId } = useClientIdentity();
  const [open, setOpen] = useAtom(isFolderPreviewOpen);
  const setCreateFolderDialogOpen = useSetAtom(
    createFolderDialogOpenAtom
  );
  const existingFolders = useQuery(
    api.private.folder.getFoldersByOrganizationAndUser,
    {}
  );

  const form = useForm<z.infer<typeof FolderSchema>>({
    resolver: zodResolver(FolderSchema),
    defaultValues: {
      name: folder?.name || "",
      isPublic: folder?.isPublic || false,
      parentFolderId: folder?.parentFolderId || undefined,
    },
  });
  useEffect(() => {
    if (folder) {
      form.reset({
        name: folder.name || "",
        isPublic: folder.isPublic || false,
        parentFolderId: folder.parentFolderId || undefined,
      });
    }
  }, [folder, form]);
  const updatFolder = useMutation(
    api.private.folder.updateFolder
  );

  const onSubmit = async (
    data: z.infer<typeof FolderSchema>
  ) => {
    try {
      await updatFolder({
        id: folder?._id as Id<"folders">,
        name: data.name,
        isPublic: data.isPublic,
        parentFolderId:
          data.parentFolderId === "none"
            ? undefined
            : (data.parentFolderId as Id<"folders">),
      });

      toast.success("Folder updated!");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Update failed!!");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
      open={open}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px] max-h-[90vh] overflow-y-auto ">
        <DialogTitle>{folder?.name}</DialogTitle>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit,
              (errors) =>
                console.log("Validation Errors:", errors)
            )}>
            {" "}
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
                        placeholder="e.g. Videos of 2025"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Folder */}
              <FormField
                control={form.control}
                name="parentFolderId"
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
