import { Plus } from "lucide-react";
import { Button } from "./button.comp";

interface CreateBoardButtonProps {
  onClick: () => void;
}

export function CreateBoardButton({ onClick }: CreateBoardButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Create Board
    </Button>
  );
}
