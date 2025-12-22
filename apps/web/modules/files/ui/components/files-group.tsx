import MediaPreview from "@/modules/files/ui/components/media-preview";
import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ScrollArea,
  ScrollBar,
} from "@workspace/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useEffect, useState } from "react";
import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import { set } from "react-hook-form";
import { useAtom, useSetAtom } from "jotai";
import {
  FileToPreviewAtom,
  isFilePreviewOpen,
} from "@/modules/files/ui/atom";
import { Button } from "@workspace/ui/components/button";
export const FilesGroup = () => {
  const [openFilePreview, setOpenFilePreview] = useAtom(
    isFilePreviewOpen
  );
  const setFileToPreview = useSetAtom(FileToPreviewAtom);

  const [tabValue, setTabValue] = useState("all");
  const files = useQuery(
    api.public.media.getFilesByOrganization,
    {}
  );
  const [filteredFiles, setFilteredFiles] = useState<
    Doc<"media">[]
  >(files || []);

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
    <div className="w-full h-fit lg:w-3/5 border rounded-md py-4 px-2">
      <div className="pb-3 px-3 flex justify-between items-end gap-2">
        <Tabs
          defaultValue="all"
          value={tabValue}
          className="w-full max-w-fit"
          onValueChange={(value) => setTabValue(value)}>
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
      <ScrollArea>
        <div className=" py-0 p-3">
          <div className=" lg:max-h-[calc(100vh-188px)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
            {filteredFiles.map((file) => {
              return (
                <div
                  onClick={() => {
                    setFileToPreview(file);
                    setOpenFilePreview(true);
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
  );
};
