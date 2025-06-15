import { boardsApi } from "@/api/boards.api";
import { columnsApi } from "@/api/columns.api";
import { useUserName } from "@/hooks/useUserName";
import type { Board } from "@/types/api.types";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router";

interface BoardSideboardProps {
  board: Board;
  onDelete?: () => void;
}

export function BoardSideboard({ board, onDelete }: BoardSideboardProps) {
  const { userName, loading } = useUserName(board.ownerId);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm("Delete this board?")) return;
    try {
      await boardsApi.deleteBoard(board.id);
      // delete columns cascade naive
      const columns = await columnsApi.getBoardColumns(board.id);
      await Promise.all(columns.map((c) => columnsApi.deleteColumn(c.id)));
      onDelete?.();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-60 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-6 text-sm text-white">
      <div>
        <div className="text-zinc-400 text-xs mb-1">Updated</div>
        <div>{new Date(board.updatedAt).toLocaleString()}</div>
      </div>
      <div>
        <div className="text-zinc-400 text-xs mb-1">Owner</div>
        <div>{loading ? "Loading..." : userName}</div>
      </div>
      <button
        onClick={handleDelete}
        className="mt-auto flex items-center gap-1 text-red-400 hover:text-red-300 text-xs"
      >
        <XCircle className="w-4 h-4" /> Delete board
      </button>
    </div>
  );
} 