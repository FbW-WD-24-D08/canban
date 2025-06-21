import { CreateBoardButton } from "../atoms/create-board-button.comp";
import { BoardSortControls } from "../molecules/board-sort-controls.comp";

type SortBy = "title" | "date";
type SortOrder = "asc" | "desc";

interface BoardToolbarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  onCreateBoard: () => void;
}

export function BoardToolbar({
  sortBy,
  sortOrder,
  onSortChange,
  onCreateBoard,
}: BoardToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <BoardSortControls
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
      <CreateBoardButton onClick={onCreateBoard} />
    </div>
  );
}
