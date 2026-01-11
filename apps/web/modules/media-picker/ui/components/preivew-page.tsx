import { ImagePreview } from "@/modules/files/ui/components/file-preview-dialog";
import MediaDetails from "@/modules/media-picker/ui/components/media-details";
import { PreviewMediaAtom } from "@workspace/ui/lib/atoms";
import { VideoPlayer } from "@workspace/ui/modules/video-player";
import { useAtomValue } from "jotai";
import Image from "next/image";

const PreviewPage = () => {
  const media = useAtomValue(PreviewMediaAtom);

  return (
    <div className="flex flex-col gap-2 lg:flex-row w-full h-fit  p-2">
      <div className="w-full p-2 border rounded-md">
        {media ? (
          <>
            {(media?.type === "image" ||
              media?.type === "gif") && (
              <ImagePreview
                src={media?.url ?? ""}
                alt={media?.name ?? "media Preview"}
              />
            )}
            {media?.type === "video" && (
              <VideoPlayer
                url={media.url ?? ""}
                poster={media.thumbnailUrl}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <span>No Preview Available</span>
            <span>Pick a Media to preview</span>
          </div>
        )}
      </div>
      {media && <MediaDetails media={media} />}
    </div>
  );
};

export default PreviewPage;
