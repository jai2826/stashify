"use client";
import VercelPlugin from "@/modules/integrations/ui/components/vercel-plugin";
import PreviewPage from "@/modules/media-picker/ui/components/preivew-page";
import { Button } from "@workspace/ui/components/button";
import { OpenPreviewMediaAtom } from "@workspace/ui/lib/atoms";
import { useAtom } from "jotai";
import { PlugIcon, PointerIcon } from "lucide-react";

export const MediaPickerView = () => {
  const [isOpen, setIsOpen] = useAtom(OpenPreviewMediaAtom);
  console.log(isOpen)
  return (
    <div className="w-full h-full">
      <div className="flex gap-2 flex-row justify-between md:items-center w-full p-4 border-b">
        <div className="flex flex-1 gap-2 items-center justify-between">
          <h1 className="text-3xl font-mono font-medium">
            Media Picker
          </h1>
        </div>
        <div className=" flex space-x-2 items-center justify-between">
          <Button
            onClick={() => setIsOpen(true)}
            className="text-lg font-sans">
            <PointerIcon />
            Pick
          </Button>
        </div>
      </div>
      <div className="flex gap-4 p-4">
        <PreviewPage />
      </div>
    </div>
  );
};
