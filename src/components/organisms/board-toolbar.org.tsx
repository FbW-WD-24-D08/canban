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
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
      <BoardSortControls
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
      <CreateBoardButton onClick={onCreateBoard} />
    </div>
  );
}
