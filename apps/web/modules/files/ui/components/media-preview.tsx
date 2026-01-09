import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import { PlayIcon } from "lucide-react";
import Image from "next/image";

interface MediaPreviewProps {
  media: Doc<"media">;
}

const MediaPreview = ({ media }: MediaPreviewProps) => {
  if (media.type === "image" || media.type === "gif") {
    return (
      <div className="group cursor-pointer relative overflow-hidden rounded-md group">
        <ImagePreview
          src={media.url}
          alt={media.name}
        />
        <div className="absolute -bottom-10 inset-x-0 transform  group-hover:bottom-0 flex items-end text-primary justify-center bg-black/20 group-hover:bg-black/40 transition-all p-1 text-sm font-mono">
          {media.name}
        </div>
      </div>
    );
  } else if (media.type === "video") {
    return (
      <div className="cursor-pointer relative overflow-hidden rounded-md group">
        <ImagePreview
          src={media.thumbnailUrl!}
          alt={media.name}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
          <PlayIcon className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute -bottom-10 inset-x-0 transform  group-hover:bottom-0 flex items-end text-primary justify-center bg-black/20 group-hover:bg-black/40 transition-all p-1 text-sm font-mono">
          {media.name}
        </div>
      </div>
    );
  }
};

export default MediaPreview;

const ImagePreview = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
      <Image
        loading="lazy"
        alt={alt}
        src={src}
        width={200}
        height={120}
        className="h-full w-auto object-contain"
      />
    </div>
  );
};
