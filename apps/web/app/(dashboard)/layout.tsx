import DashboardLayout from "@/modules/dashboard/ui/layouts/dashboard-layout";
import { FilePreviewDialog } from "@/modules/files/ui/components/file-preview-dialog";
import { FoldePreviewDialog } from "@/modules/folders/ui/components/folder-preview-dialog";
import { CreateFolderDialog } from "@workspace/ui/modules/create-folder-dialog";
import { UploadDialog } from "@workspace/ui/modules/upload-dialog";

const layout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DashboardLayout>
      <UploadDialog />
      <CreateFolderDialog />
      <FilePreviewDialog />
      <FoldePreviewDialog />
      {children}
    </DashboardLayout>
  );
};

export default layout;
