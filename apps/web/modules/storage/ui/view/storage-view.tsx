"use client";
import VercelPlugin from "@/modules/integrations/ui/components/vercel-plugin";

export const StorageView = () => {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 md:flex-row justify-between md:items-center w-full p-4 border-b">
        <div className="flex gap-2 items-center justify-between">
          <h1 className="text-3xl font-mono font-medium">
            Storage
          </h1>
        </div>
      </div>
      <div className="p-4 text-xl w-full font-mono">
        Setup your storage integrations here. <br />
        As of now, only Vercel integration is supported. More integrations are coming soon!
      </div>
      <div className="flex gap-4 p-4">
        <VercelPlugin />
      </div>
    </div>
  );
};
