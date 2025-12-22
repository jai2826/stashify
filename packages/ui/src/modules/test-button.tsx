import { Button } from "@workspace/ui/components/button";
import { useUploadModal } from "@workspace/ui/hooks/use-upload-modal";

export const TestButton = () => {
  const { openUpload } = useUploadModal();
  return (
    <Button onClick={() => openUpload()}>
      Test Button
    </Button>
  );
};
