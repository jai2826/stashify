"use client";
import { FilesGroup } from "@/modules/files/ui/components/files-group";
import MediaPreview from "@/modules/files/ui/components/media-preview";
import { api } from "@workspace/backend/convex/_generated/api";
import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  ScrollArea,
  ScrollBar,
} from "@workspace/ui/components/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  OpenPreviewMediaAtom,
  PreviewMediaAtom,
} from "@workspace/ui/lib/atoms";
import { useQuery } from "convex/react";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

const MediaPickerDialog = () => {
  const [isOpen, setIsOpen] = useAtom(OpenPreviewMediaAtom);
  console.log(isOpen);

  const [tabValue, setTabValue] = useState("all");
  const files = useQuery(
    api.public.media.getFilesByOrganization,
    {}
  );
  const [filteredFiles, setFilteredFiles] = useState<
    Doc<"media">[]
  >([]);

  const [previewMedia, setPreviewMedia] = useAtom(
    PreviewMediaAtom
  );

  useEffect(() => {
    if (tabValue === "all") {
      setFilteredFiles(files || []);
      return;
    }
    setFilteredFiles(
      files?.filter((file) => {
        return file.type === tabValue;
      }) || []
    );
  }, [tabValue, files]);

  if (!files) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogContent className="flex-1 md:min-w-[calc(100vw-3rem)] lg:min-w-[900px] max-h-[90vh] overflow-y-auto ">
        <DialogTitle className="flex justify-between items-center mr-4 mt-2">
          <div className="w-full h-fit  border rounded-md py-4 px-2">
            <div className="pb-3 px-3 flex justify-between items-end gap-2">
              <Tabs
                defaultValue="all"
                value={tabValue}
                className="w-full max-w-fit"
                onValueChange={(value) =>
                  setTabValue(value)
                }>
                <TabsList>
                  <TabsTrigger
                    value="all"
                    className="w-auto px-3">
                    All Files
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="w-auto px-3">
                    Images
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="w-auto px-3">
                    Videos
                  </TabsTrigger>
                  <TabsTrigger
                    value="gif"
                    className="w-auto px-3">
                    Gifs
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="text-xl text-nowrap text-primary-foreground font-medium">
                {filteredFiles.length} Files
              </div>
            </div>
            {filteredFiles.length === 0 && (
              <div className="p-4 italic text-sm text-center text-muted-foreground">
                No files in this folder.
              </div>
            )}
            <ScrollArea>
              <div className=" py-0 p-3">
                <div className=" lg:max-h-[calc(100vh-188px)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                  {filteredFiles.map((file) => {
                    return (
                      <div
                        onClick={() => {
                          setPreviewMedia(file);
                          setIsOpen(false);
                        }}
                        key={file._id}>
                        <MediaPreview media={file} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPickerDialog;
