"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useState } from "react";

interface VideoPlayerProps {
  url: string;
  poster?: string; // Image to show while loading
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({
  url,
  poster,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const [isClient, setIsClient] = useState(false);

  // Fixes hydration issues in Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="aspect-video w-full bg-muted animate-pulse rounded-xl" />
    );
  }

  return (
    <div
      className={cn(
        " aspect-video w-full overflow-hidden rounded-md bg-black border border-white/10 shadow-2xl",
        className
      )}>
      <video
        src={url}
        poster={poster}
        controls
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        className={cn(
          "h-full w-full object-center object-contain"
        )}
        // Prevents users from easily downloading the video (standard dashboard practice)
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}>
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
