import { boardsApi } from "@/api/boards.api";
import { useUserContext } from "@/components/contexts/user.context";
import { useUserName } from "@/hooks/useUserName";
import { X } from "lucide-react";
import { useState } from "react";
import { useToast } from "../contexts/toast.context";
import { RemoveMemberModal } from "../molecules/confirmation-modal.comp";

interface MemberItemProps {
  userId: string;
  boardId?: string;
  ownerId?: string;
  onRemove?: () => void;
}

export function MemberItem({
  userId,
  boardId,
  ownerId,
  onRemove,
}: MemberItemProps) {
  const { userName, loading } = useUserName(userId);
  const isOwner = userId === ownerId;
  const { currentUser } = useUserContext();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const toast = useToast();

  const isCurrentUserOwner = currentUser?.id === ownerId;
  const isCurrentUser = currentUser?.id === userId;
  const canRemove =
    (isCurrentUserOwner && !isCurrentUser) || (isCurrentUser && !isOwner);

  const handleRemove = async () => {
    if (!boardId || isOwner) return;

    try {
      setRemoving(true);
      await boardsApi.removeMember(boardId, userId);
      toast.success("Member removed", `${userName || userId} has been removed from this board.`);
      onRemove?.();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Remove failed", "Could not remove the member. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className="group flex items-center justify-between text-xs text-zinc-300 py-1 px-2 rounded hover:bg-zinc-700/50">
        <span className="flex-1">
          {loading ? "Loading..." : userName}
          {isOwner && <span className="ml-1 text-amber-400">(Owner)</span>}
        </span>
        {canRemove && boardId && (
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="ml-2 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Remove member"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <RemoveMemberModal
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        onConfirm={handleRemove}
        memberName={userName || userId}
        loading={removing}
      />
    </>
  );
}
