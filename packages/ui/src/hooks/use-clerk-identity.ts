import { useUser, useOrganization } from "@clerk/nextjs";

export const useClientIdentity = () => {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { isLoaded: orgLoaded, organization } = useOrganization();

  // The application is "loading" until both Clerk providers resolve
  const isLoading = !userLoaded || !orgLoaded;

  return {
    isLoading,
    isSignedIn,
    userId: user?.id,
    orgId: organization?.id,
    // Useful for file pathing: defaults to Org ID, falls back to User ID
    ownerId: organization?.id ?? user?.id, 
    userEmail: user?.primaryEmailAddress?.emailAddress,
    orgRole: organization?.id ? "org_member" : "personal",
  };
};