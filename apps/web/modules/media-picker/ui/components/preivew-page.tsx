import { ImagePreview } from "@/modules/files/ui/components/file-preview-dialog";
import { PreviewMediaAtom } from "@workspace/ui/lib/atoms";
import { VideoPlayer } from "@workspace/ui/modules/video-player";
import { useAtomValue } from "jotai";
import Image from "next/image";

const PreviewPage = () => {
  const file = useAtomValue(PreviewMediaAtom);

  return (
    <div className="flex flex-col lg:flex-row w-full h-fit lg:w-3/5  p-2">
      <div className=" p-2 border rounded-md">
        {file ? (
          <>
            {(file?.type === "image" ||
              file?.type === "gif") && (
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
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <span>No Preview Available</span>
            <span>Pick a media to preview</span>
          </div>
        )}
      </div>
      {file && <div>Hello Harry</div>}
    </div>
  );
};

export default PreviewPage;
