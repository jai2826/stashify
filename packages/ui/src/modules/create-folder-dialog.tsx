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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useMutation, useQuery } from "convex/react";

import { Id } from "@workspace/backend/convex/_generated/dataModel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "@workspace/ui/modules/searchable-select";
import { useAtomValue, useSetAtom } from "jotai";
import { createFolderDialogOpenAtom } from "@workspace/ui/lib/atoms";



const FolderFormSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentFolderId: z.string().optional(),
  isPublic: z.boolean(),
});

export const CreateFolderDialog = () => {
  const open = useAtomValue(
    createFolderDialogOpenAtom
  );
  const onOpenChange = useSetAtom(
    createFolderDialogOpenAtom
  );

  const createFolder = useMutation(
    api.private.folder.createFolder
  );

  const form = useForm<z.infer<typeof FolderFormSchema>>({
    resolver: zodResolver(FolderFormSchema),
    defaultValues: {
      name: "",
      parentFolderId: undefined,
      isPublic: false,
    },
  });
  const existingFolders = useQuery(
    api.private.folder.getFoldersByOrganizationAndUser,
    {}
  );

  const onSubmit = async (
    data: z.infer<typeof FolderFormSchema>
  ) => {
    try {
      await createFolder({
        name: data.name,
        parentFolderId:
          data.parentFolderId === "none"
            ? undefined
            : (data.parentFolderId as Id<"folders">),
        isPublic: data.isPublic,
      });
      toast.success("Folder created successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error(
        "Failed to create folder. Please try again."
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      //TODO: Fix IT After USE
      open={open}>
      <DialogContent className="flex-1  md:min-w-[calc(100vw-3rem)] lg:min-w-[900px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your media
                files.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4  md:grid md:grid-cols-2 gap-4 space-y-4">
              {/* Folder Name */}
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
                        placeholder="e.g. Summer Vacation 2022"
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
                  <FormItem className="space-y-2">
                    <FormLabel>Parent Folder</FormLabel>
                    {/* <Select
                      value={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              "Select Parent Folder"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="w-full"
                        align="end">
                        <SelectItem value="none">
                          None
                        </SelectItem>
                        {existingFolders?.map((folder) => (
                          <SelectItem
                            value={folder._id}
                            key={folder._id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
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
            </div>
            <DialogFooter>
              <Button
                disabled={form.formState.isSubmitting}
                onClick={handleCancel}
                type="button"
                variant={"outline"}>
                Cancel
              </Button>
              <Button
                disabled={form.formState.isSubmitting}
                type="submit">
                {form.formState.isSubmitting
                  ? "Creating..."
                  : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
