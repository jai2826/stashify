"use client";

import { AuthLayout } from "@/modules/auth/ui/layouts/auth-layout";
import { OrgSelectView } from "@/modules/auth/ui/views/org-select-view";
import { useOrganization } from "@clerk/nextjs";

export const OrganizationGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { organization } = useOrganization();
  if (!organization) {
    return (
      <AuthLayout>
        <OrgSelectView />
      </AuthLayout>
    );
  }

  return <div>{children}</div>;
};
