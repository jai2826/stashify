import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAtom, useSetAtom } from "jotai";
import { LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { api } from "@workspace/backend/convex/_generated/api";
import { Doc, Id } from "@workspace/backend/convex/_generated/dataModel";

import {
  FileToPreviewAtom,
  isFilePreviewOpen,
} from "@/modules/files/ui/atom";
import SortableFileGroupView from "@/modules/folders/ui/views/sortable-files-group-view";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

export const SortableFilesGroup = ({
  folderId,
  className,
}: {
  folderId: Id<"folders">;
  className?: string;
}) => {
  const [openFilePreview, setOpenFilePreview] = useAtom(isFilePreviewOpen);
  const setFileToPreview = useSetAtom(FileToPreviewAtom);

  const [tabValue, setTabValue] = useState("all");
  const [filteredFiles, setFilteredFiles] = useState<Doc<"media">[]>([]);
  
  // This ref prevents the incoming database data from overwriting 
  // our local state during a drag operation.
  const isUpdatingRef = useRef(false);

  const data = useQuery(api.private.folder.getFolderByIdWithFiles, { folderId });
  const updateFilePositions = useMutation(api.private.folder.updatePositions);

  useEffect(() => {
    if (!data?.files || isUpdatingRef.current) return;

    // Ensure the initial data is sorted by position
    const sortedSource = [...data.files].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (tabValue === "all") {
      setFilteredFiles(sortedSource);
    } else {
      setFilteredFiles(sortedSource.filter((file) => file.type === tabValue));
    }
  }, [tabValue, data, folderId]);

  const handleReorder = async (newOrder: Doc<"media">[]) => {
    if (!data?.files) return;

    // 1. Lock the sync and update local state immediately
    isUpdatingRef.current = true;
    setFilteredFiles(newOrder);

    // 2. "Slot" Logic: Preserve the numerical positions already in use
    // This prevents clashing with hidden files in other tabs
    const currentPositions = [...filteredFiles]
      .map(f => f.position ?? 0)
      .sort((a, b) => a - b);

    const updates = newOrder.map((file, index) => ({
      fileId: file._id,
      position: currentPositions[index] ?? index, // Re-assign the existing slots to the new order
    }));

    const promise = updateFilePositions({ files: updates });

    toast.promise(promise, {
      loading: "Updating positions...",
      success: () => {
        isUpdatingRef.current = false;
        return "Order saved";
      },
      error: () => {
        isUpdatingRef.current = false;
        if (data?.files) setFilteredFiles(data.files.filter(f => tabValue === 'all' || f.type === tabValue));
        return "Failed to save order";
      },
    });
  };

  if (!data) {
    return (
      <div className="w-full h-full flex justify-center items-center py-20">
        <LoaderCircleIcon className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`w-full h-fit border rounded-md py-4 px-2 overflow-hidden ${className}`}>
      <div className="pb-3 px-3 flex justify-between items-end gap-2">
        <Tabs
          value={tabValue}
          className="w-full max-w-fit"
          onValueChange={(val) => {
            isUpdatingRef.current = false; // Reset lock on tab change
            setTabValue(val);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="gif">Gifs</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-sm font-medium text-muted-foreground">
          {filteredFiles.length} Files
        </div>
      </div>

      <SortableFileGroupView
        className="max-h-50 md:max-h-80 lg:max-h-[400px]"
        filteredFiles={filteredFiles}
        setFileToPreview={setFileToPreview}
        setOpenFilePreview={setOpenFilePreview}
        onReorder={handleReorder}
      />
    </div>
  );
};