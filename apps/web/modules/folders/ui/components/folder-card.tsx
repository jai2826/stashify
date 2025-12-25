"use client";

import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import { cn } from "@workspace/ui/lib/utils";
import { Folder } from "lucide-react";
import Image from "next/image";

type folder = Doc<"folders">;

interface FolderCardProps {
  folder: folder & {
    previewFiles?: Doc<"media">[];
  };
}

export function FolderCard({ folder }: FolderCardProps) {
  // Take only the top 3 files for the stack effect
  const previews = folder.previewFiles || [];

  return (
    <div className="group flex flex-col items-center gap-1 cursor-pointer">
      {/* Container for the folder icon and the stack */}
      <div className="relative w-44 h-36 flex items-center justify-center transition-transform group-hover:-translate-y-1">
        {/* The Base Folder Icon */}
        <Folder className="absolute inset-0 w-full h-full text-primary/10 fill-primary/20 group-hover:fill-primary/30 transition-colors" />
        {folder.isPublic && (
          <div className="absolute rounded-full top-6 left-8 w-2 h-2 bg-primary" />
        )}
        {/* The Stacked Images Container */}
        <div className="relative w-28 h-20 mt-2">
          {previews.length > 0 ? (
            previews.map((file, index) => (
              <div
                key={file._id}
                className={cn(
                  "absolute inset-0 rounded-md border-2 border-white shadow-md overflow-hidden transition-all duration-300 bg-white",
                  // Stack positioning:
                  // Index 0 is the front-most
                  index === 0 &&
                    "z-50 scale-100 translate-y-0",
                  // Index 1 is the middle card
                  index === 1 &&
                    "z-40 scale-95 -translate-y-2  translate-x-2 ",
                  // Index 2 is the seconed from back-most card
                  index === 2 &&
                    "z-30 scale-90 -translate-y-4 translate-x-4  ",
                  // Index 3 is the back-most card
                  index === 3 &&
                    "z-20 scale-80 -translate-y-6 translate-x-6 "
                )}>
                <Image
                  src={file.thumbnailUrl || file.url}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            // Empty State
            <div className="absolute inset-0 bg-white/50 border border-dashed border-primary/50 rounded-md flex items-center justify-center">
              <span className="text-[10px] text-primary font-medium">
                Empty
              </span>
            </div>
          )}
        </div>
      </div>

      <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
        {folder.name}
      </span>
    </div>
  );
}
