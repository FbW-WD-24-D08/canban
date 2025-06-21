import { Plus } from "lucide-react";
import { Button } from "./button.comp";

interface CreateBoardButtonProps {
  onClick: () => void;
}

export function CreateBoardButton({ onClick }: CreateBoardButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-teal-600 hover:bg-teal-700 flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto justify-center"
    >
      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Create Board</span>
      <span className="sm:hidden">Create</span>
    </Button>
  );
}
