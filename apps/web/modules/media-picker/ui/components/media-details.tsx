import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Could not copy text: ", err);
  });
};

const MediaDetails = ({
  media,
}: {
  media: Doc<"media">;
}) => {
  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="w-full lg:w-4/5 border p-2 rounded-md">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(media).map(([key, value]) => {
          if (
            key === "_creationTime" ||
            key === "isModerated" ||
            key === "isOptimized" ||
            key === "originalUrl" ||
            key === "position" 
          ) {
            return null;
          }

          

          return (
            <div
              key={key + value}
              className="w-full flex gap-2">
              <Label className="capitalize">{key}: </Label>
              <Input
                value={value ?? ""}
                disabled={true}
                className="disabled:text-neutral-900 disabled:opacity-80 w-full"
              />

              <Button
                onClick={() => handleCopy(value ?? "")}
                type="button"
                variant="default"
                size="icon">
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MediaDetails;
