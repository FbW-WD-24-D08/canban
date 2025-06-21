import type { Board } from "../../types/api.types";
import { Pagination } from "../molecules/pagination.comp";
import { BoardCard } from "./board-card.org";

interface BoardListProps {
  boards: Board[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onBoardClick: (board: Board) => void;
}

export function BoardList({
  boards,
  currentPage,
  totalPages,
  onPageChange,
  onBoardClick,
}: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-zinc-400 text-base sm:text-lg mb-2">No boards found</div>
        <div className="text-zinc-500 text-sm">
          Create your first board to get started
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onClick={() => onBoardClick(board)}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
