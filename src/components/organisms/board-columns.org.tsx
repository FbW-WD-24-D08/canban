interface BoardColumnsProps {
  boardId: string;
}

export function BoardColumns({ boardId }: BoardColumnsProps) {
  console.log("BoardColumns will use boardId:", boardId);
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <div className="text-zinc-400 text-center py-12">
        Columns will be displayed here
      </div>
    </div>
  );
}
