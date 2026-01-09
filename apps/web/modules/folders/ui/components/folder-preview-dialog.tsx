"use client";

import {
  FolderToPreviewAtom,
  isFolderPreviewOpen,
} from "@/modules/files/ui/atom";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useClientIdentity } from "@workspace/ui/hooks/use-clerk-identity";
import { createFolderDialogOpenAtom } from "@workspace/ui/lib/atoms";
import { SearchableSelect } from "@workspace/ui/modules/searchable-select";
import { useMutation, useQuery } from "convex/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  CopyIcon,
  Loader2,
  PlusCircleIcon,
  SaveIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Card } from "@workspace/ui/components/card";
import { FoldersGroup } from "@/modules/folders/ui/components/folders-group";
import { FilesGroup } from "@/modules/files/ui/components/files-group";
import { SortableFilesGroup } from "@/modules/folders/ui/components/sortable-files-group";

const FolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  isPublic: z.boolean().optional(),
  parentFolderId: z.string().optional(),
});

export const FoldePreviewDialog = () => {
  const folder = useAtomValue(FolderToPreviewAtom);
  const [open, setOpen] = useAtom(isFolderPreviewOpen);
  const setCreateFolderDialogOpen = useSetAtom(
    createFolderDialogOpenAtom
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const existingFolders = useQuery(
    api.private.folder.getFoldersByOrganizationAndUser,
    {}
  );

  const form = useForm<z.infer<typeof FolderSchema>>({
    resolver: zodResolver(FolderSchema),
    defaultValues: {
      name: "",
      isPublic: false,
      parentFolderId: undefined,
    },
  });

  const pending = form.formState.isSubmitting || isDeleting;

  useEffect(() => {
    if (folder) {
      form.reset({
        name: folder.name || "",
        isPublic: folder.isPublic || false,
        parentFolderId: folder.parentFolderId || undefined,
      });
    }
  }, [folder, form]);

  const updateFolder = useMutation(
    api.private.folder.updateFolder
  );
  const deleteFolder = useMutation(
    api.private.folder.deleteFolder
  );

  const onSubmit = async (
    data: z.infer<typeof FolderSchema>
  ) => {
    try {
      await updateFolder({
        id: folder?._id as Id<"folders">,
        name: data.name,
        isPublic: data.isPublic,
        parentFolderId:
          data.parentFolderId === "none" ||
          !data.parentFolderId
            ? undefined
            : (data.parentFolderId as Id<"folders">),
      });

      toast.success("Folder updated!");
    } catch (error) {
      console.error(error);
      toast.error("Update failed!!");
    }
  };

  const handleDelete = async () => {
    if (!folder?._id) return;
    setIsDeleting(true);
    try {
      await deleteFolder({
        id: folder._id as Id<"folders">,
      });
      toast.success("Folder deleted!");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (pending) return;
    setOpen(false);
    form.reset();
  };

  const handleCopy = async () => {
    if (!folder?._id) return;
    try {
      await navigator.clipboard.writeText(folder._id);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => !pending && setOpen(isOpen)}
      open={open}>
      <DialogContent className="flex-1 md:min-w-[calc(100vw-3rem)] lg:min-w-[900px] max-h-[90vh] ">
        <DialogTitle className="flex justify-between md:items-center mr-2  md:mr-4 md:mt-2">
          <div className="flex flex-col md:flex-row items-start gap-3 text-2xl font-semibold w-full">
            {folder?.name}

            <div className="flex gap-2">
              <Input
                value={folder?._id}
                disabled={true}
                className=" w-40 md:w-fit"
              />

              <Button
                onClick={handleCopy}
                type="button"
                value={folder?._id}
                variant="default"
                size="icon">
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            disabled={pending}
            variant="destructive"
            onClick={handleDelete}
            size="sm">
            {isDeleting ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              <TrashIcon />
            )}
            Delete Folder
          </Button>
        </DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset
              disabled={pending}
              className="space-y-4">
              <div className="my-4 md:grid md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
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

                <FormField
                  control={form.control}
                  name="parentFolderId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="flex items-center">
                        Parent Folder
                        <Button
                          onClick={() =>
                            setCreateFolderDialogOpen(true)
                          }
                          type="button"
                          disabled={pending}
                          className="text-xs ml-auto cursor-pointer"
                          size={"icon-xs"}>
                          <PlusCircleIcon />
                        </Button>
                      </FormLabel>

                      <SearchableSelect
                        options={
                          existingFolders
                            ?.filter(
                              (f: any) =>
                                f._id !== folder?._id
                            )
                            ?.map((f: any) => ({
                              label: f.name,
                              value: f._id,
                            })) ?? []
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
              </div>
            </fieldset>

            <DialogFooter className="mt-6">
              <Button
                disabled={pending}
                onClick={handleCancel}
                type="button"
                variant={"outline"}>
                <XCircleIcon />
                Cancel
              </Button>
              <Button
                disabled={
                  !form.formState.isDirty || pending
                }
                className="hover:opacity-80"
                type="submit">
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  <SaveIcon />
                )}
                {form.formState.isSubmitting
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <SortableFilesGroup folderId={folder?._id!} />
      </DialogContent>
    </Dialog>
  );
};
