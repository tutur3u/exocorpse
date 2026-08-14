export type AdminTeamRole = {
  id: string;
  name: string;
};

export type AdminTeamMember = {
  avatar_url?: string | null;
  created_at?: string | null;
  display_name?: string | null;
  email?: string | null;
  handle?: string | null;
  id?: string | null;
  is_creator: boolean;
  pending?: boolean;
  roles: AdminTeamRole[];
  workspace_member_type?: "GUEST" | "MEMBER" | null;
};

export type AdminTeamPayload = {
  context: {
    boundProjectName: string | null;
    canManageMembers: boolean;
    canManageRoles: boolean;
    currentUserEmail: string | null;
    workspaceId: string;
  };
  members: AdminTeamMember[];
  roles: AdminTeamRole[];
};

export type AdminDriveItem = {
  contentType: string | null;
  createdAt: string | null;
  kind: "file" | "folder";
  name: string;
  path: string;
  size: number;
  updatedAt: string | null;
};

export type AdminDriveAnalytics = {
  fileCount: number;
  largestFile: { createdAt: string; name: string; size: number } | null;
  scannedObjectLimit: number;
  smallestFile: { createdAt: string; name: string; size: number } | null;
  storageLimit: number;
  totalSize: number;
  truncated: boolean;
  usagePercentage: number;
};

export type AdminDriveListing = {
  items: AdminDriveItem[];
  path: string;
  provider: "r2" | "supabase";
  total: number;
};

export type AdminDrivePayload = {
  analytics: AdminDriveAnalytics;
  listing: AdminDriveListing;
};
