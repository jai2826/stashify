"use client";
import { FilesGroup } from "@/modules/files/ui/components/files-group";
import { FoldersGroup } from "@/modules/folders/ui/components/folders-group";
import { Button } from "@workspace/ui/components/button";
import { useCreateFolderModal } from "@workspace/ui/hooks/use-create-folder-modal";
import { useUploadModal } from "@workspace/ui/hooks/use-upload-modal";
import { SearchBar } from "@workspace/ui/modules/search-bar";
import { FilterIcon } from "lucide-react";

interface FolderViewProps {}

export const FolderView = ({}: FolderViewProps) => {
  const { openCreateFolder } = useCreateFolderModal();
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 md:flex-row justify-between md:items-center w-full p-4 border-b">
        <div className="flex gap-2 items-center justify-between">
          <h1 className="text-3xl font-mono font-medium">
            Folders
          </h1>
          {/* TODO: Add Filter Setup */}
          <Button
            variant="outline"
            className="font-sans"
            size={"icon-sm"}>
            <FilterIcon className="size-5" />
          </Button>
        </div>
        <div className=" flex space-x-2 items-center justify-between">
          <SearchBar
            placeholder="Search folders..."
            onSearch={(query) => console.log(query)}
          />

          <Button
            onClick={() => openCreateFolder()}
            className="text-lg font-sans">
            Create Folder
          </Button>
        </div>
      </div>
      <div className="flex gap-4 p-4">
        <FoldersGroup />
        {/* <FilePreview />  */}
      </div>
    </div>
  );
};
