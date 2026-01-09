"use client";
import VercelPlugin from "@/modules/integrations/ui/components/vercel-plugin";

export const IntegrationView = () => {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 md:flex-row justify-between md:items-center w-full p-4 border-b">
        <div className="flex gap-2 items-center justify-between">
          <h1 className="text-3xl font-mono font-medium">
            Integrations
          </h1>
        </div>
        <div className=" flex space-x-2 items-center justify-between">
          {/* <Button
            onClick={() => {
              console.log("first");
            }}
            className="text-lg font-sans">
            <PlugIcon/>
            Add
          </Button> */}
        </div>
      </div>
      <div className="flex gap-4 p-4">
        <VercelPlugin/>
      </div>
    </div>
  );
};
