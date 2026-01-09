"use client";
import { FilesGroup } from "@/modules/files/ui/components/files-group";
import { api } from "@workspace/backend/convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useUploadModal } from "@workspace/ui/hooks/use-upload-modal";
import { SearchBar } from "@workspace/ui/modules/search-bar";
import { useQuery } from "convex/react";
import { FilterIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface FilesViewProps {}

export const FilesView = ({}: FilesViewProps) => {
  const { openUpload } = useUploadModal();

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 md:flex-row justify-between md:items-center w-full p-4 border-b">
        <div className="flex gap-2 items-center justify-between">
          <h1 className="text-3xl font-mono font-medium">
            Files
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
            placeholder="Search files..."
            onSearch={(query) => console.log(query)}
          />

          <Button
            onClick={() => openUpload()}
            className="text-lg font-sans">
            Upload File
          </Button>
        </div>
      </div>
      <div className="flex gap-4 p-4">
        <FilesGroup />
        {/* <FilePreview />  */}
      </div>
    </div>
  );
};
