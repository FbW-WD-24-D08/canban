import { useUserName } from "@/hooks/useUserName";
import { boardsApi } from "@/api/boards.api";
import { X } from "lucide-react";
import { useUserContext } from "../contexts/user.context.tsx";

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

  const isCurrentUserOwner = currentUser?.id === ownerId;
  const isCurrentUser = currentUser?.id === userId;
  const canRemove =
    (isCurrentUserOwner && !isCurrentUser) || (isCurrentUser && !isOwner);

  const handleRemove = async () => {
    if (!boardId || isOwner) return;

    if (!confirm(`Remove ${userName || userId} from this board?`)) return;

    try {
      await boardsApi.removeMember(boardId, userId);
      onRemove?.();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };
  return (
    <div className="group flex items-center justify-between text-xs text-zinc-300 py-1 px-2 rounded hover:bg-zinc-700/50">
      <span className="flex-1">
        {loading ? "Loading..." : userName}
        {isOwner && <span className="ml-1 text-amber-400">(Owner)</span>}
      </span>
      {canRemove && boardId && (
        <button
          onClick={handleRemove}
          className="ml-2 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Remove member"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
