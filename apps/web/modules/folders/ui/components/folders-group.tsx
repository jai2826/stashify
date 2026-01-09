import {
  FolderToPreviewAtom,
  isFolderPreviewOpen,
} from "@/modules/files/ui/atom";
import { FolderCard } from "@/modules/folders/ui/components/folder-card";
import { api } from "@workspace/backend/convex/_generated/api";
import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import {
  ScrollArea,
  ScrollBar,
} from "@workspace/ui/components/scroll-area";
import { useQuery } from "convex/react";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

type FolderType = Doc<"folders"> & {
  previewFiles?: Doc<"media">[];
};

export const FoldersGroup = () => {
  const [openFolderPreview, setOpenFolderPreview] = useAtom(
    isFolderPreviewOpen
  );
  const setFolderToPreview = useSetAtom(
    FolderToPreviewAtom
  );

  const folders = useQuery(
    api.private.folder.listFoldersWithPreviews,
    {}
  );
  const [filteredFolders, setFilteredFolders] = useState<
    FolderType[]
  >([]);

  useEffect(() => {
    setFilteredFolders(folders || []);
    return;
  }, [folders]);

  if (!folders) {
    return <div>Loading...</div>;
  } else if (folders.length === 0) {
    return (
      <div className="italic text-sm w-full h-fit lg:w-3/5 border rounded-md py-4 px-2 flex items-center justify-center">
        No folders found. Create a folder to get started!
      </div>
    );
  }
  return (
    <div className="w-full h-fit lg:w-3/5 border rounded-md py-4 px-2">
      <ScrollArea>
        <div className=" py-0 p-3">
          <div className=" lg:max-h-[calc(100vh-188px)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
            {filteredFolders.map((folder) => {
              return (
                <div
                  key={folder._id}
                  onClick={() => {
                    setFolderToPreview({
                      _id: folder._id,
                      _creationTime: folder._creationTime,
                      name: folder.name,
                      organizationId: folder.organizationId,
                      userId: folder.userId,
                      isPublic: folder.isPublic,
                      parentFolderId: folder.parentFolderId,
                    });
                    setOpenFolderPreview(true);
                  }}>
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
