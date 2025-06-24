import { useUserContext } from "@/components/contexts/user.context";
import type { Board } from "@/types/api.types";
import { useEffect, useState } from "react";
import { useBoardMembers } from "./useBoardMembers";

export interface BoardPermissions {
  canEditColumns: boolean;
  canDeleteColumns: boolean;
  canEditBoard: boolean;
  canDeleteBoard: boolean;
  canManageMembers: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loading: boolean;
}

export function useBoardPermissions(board: Board | null): BoardPermissions {
  const { currentUser, isOrganizationAdmin, isOrganizationMember } =
    useUserContext();
  const { members, loading: membersLoading } = useBoardMembers(
    board?.id || null
  );
  const [permissions, setPermissions] = useState<BoardPermissions>({
    canEditColumns: false,
    canDeleteColumns: false,
    canEditBoard: false,
    canDeleteBoard: false,
    canManageMembers: false,
    isOwner: false,
    isAdmin: false,
    isMember: false,
    loading: true,
  });

  useEffect(() => {
    if (!board || !currentUser || membersLoading) {
      setPermissions((prev) => ({ ...prev, loading: true }));
      return;
    }

    const isOwner = board.ownerId === currentUser.id;
    const isBoardMember = members.some(
      (member) => member.userId === currentUser.id
    );

    // Use the organization admin flag from UserContext
    const isAdmin = isOrganizationAdmin || isOwner;

    console.log("🔍 Permission Debug:", {
      userId: currentUser.id,
      boardOwnerId: board.ownerId,
      isOwner,
      isOrganizationAdmin,
      isOrganizationMember,
      isBoardMember,
      isAdmin,
      boardId: board.id,
    });

    // Define permissions based on role hierarchy:
    // 1. Owner: Full permissions
    // 2. Organization Admin: Column management + board editing (no deletion)
    // 3. Member: View only
    const newPermissions: BoardPermissions = {
      // Column permissions - Owners and organization admins
      canEditColumns: isOwner || isOrganizationAdmin,
      canDeleteColumns: isOwner || isOrganizationAdmin,

      // Board permissions - Only owners
      canEditBoard: isOwner,
      canDeleteBoard: isOwner,
      canManageMembers: isOwner,

      // Status flags
      isOwner,
      isAdmin: isOrganizationAdmin && !isOwner, // Admin but not owner
      isMember: isBoardMember && !isOwner && !isOrganizationAdmin,
      loading: false,
    };

    console.log("✅ Final Permissions:", newPermissions);
    setPermissions(newPermissions);
  }, [
    board,
    currentUser,
    members,
    membersLoading,
    isOrganizationAdmin,
    isOrganizationMember,
  ]);

  return permissions;
}
