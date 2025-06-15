import { columnsApi } from "@/api/columns.api";
import { tasksApi } from "@/api/tasks.api";
import { useColumns } from "@/hooks/useColumns";
import type { Column as ColumnType } from "@/types/api.types";
import type { DragEndEvent } from "@dnd-kit/core";
import { closestCorners, DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Column } from "./column.org";

interface BoardColumnsProps {
  boardId: string;
}

export function BoardColumns({ boardId }: BoardColumnsProps) {
  // (Debug log removed for production)

  const { columns, loading, refetch } = useColumns(boardId);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: any) => {
    setActiveTask(event.active?.data?.current?.task || null);
  };

  const handleAddColumn = async () => {
    if (!title.trim()) return;
    try {
      const position = columns.length;
      await columnsApi.createColumn({ title, boardId, position });
      setTitle("");
      setAdding(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const sourceColumnId = (active.data.current as { columnId: string })?.columnId;
    const targetColumnId = (over.data.current as { columnId?: string })?.columnId || (over.id as string);

    if (!targetColumnId || targetColumnId === sourceColumnId) {
      return;
    }

    try {
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      const isMovingToDone = targetColumn?.title.trim().toLowerCase() === "done";

      await tasksApi.updateTask(taskId, {
        columnId: targetColumnId,
        ...(isMovingToDone ? { status: "done" } : {}),
      });

      if (isMovingToDone) {
        let confetti;
        try {
          const mod = await import("canvas-confetti");
          confetti = mod.default;
        } catch (importErr) {
          console.error("Failed to load canvas-confetti", importErr);
        }
        if (confetti) {
          const duration = 1500; // 1.5s
          const defaults = { startVelocity: 30, spread: 60, ticks: 200, zIndex: 999999 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval: NodeJS.Timer = setInterval(() => {
            confetti({
              ...defaults,
              particleCount: 8,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
              ...defaults,
              particleCount: 8,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
          }, 300);

          setTimeout(() => clearInterval(interval), duration);
        }
      }
      setRefreshToken((t) => t + 1);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {loading ? (
          <div className="text-zinc-400 text-sm">Loading columns...</div>
        ) : columns.length === 0 ? (
          <div className="text-zinc-500 text-sm">No columns yet</div>
        ) : (
          columns.map((col: ColumnType) => (
            <Column key={`${col.id}-${refreshToken}`} column={col} refreshToken={refreshToken} />
          ))
        )}

        {/* Add column UI */}
        {adding ? (
          <div className="w-72 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <input
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="Column title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddColumn}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setTitle("");
                }}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-72 h-10 flex-shrink-0 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:border-teal-500 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add column
          </button>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="bg-zinc-800/80 border border-teal-500 rounded-lg p-3 text-sm text-white w-64 pointer-events-none">
            <div className="font-medium mb-1">{activeTask.title}</div>
            {activeTask.description && (
              <p className="text-xs text-zinc-400 line-clamp-2">{activeTask.description}</p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
