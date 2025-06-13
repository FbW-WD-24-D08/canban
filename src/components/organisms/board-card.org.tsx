import { Calendar, User } from "lucide-react";
import type { Board } from "../../types/api.types";
import { useUserName } from "../../hooks/useUserName";

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  const { userName, loading } = useUserName(board.ownerId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:border-teal-500"
    >
      <div className="justify-between flex flex-col h-full">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 truncate">
            {board.title}
          </h3>

          {board.description && (
            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
              {board.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          {" "}
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-24">
              {loading ? "Loading..." : userName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(board.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
