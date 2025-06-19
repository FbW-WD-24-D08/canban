import { columnsApi } from "@/api/columns.api";
import { tasksApi } from "@/api/tasks.api";
import { useColumns } from "@/hooks/useColumns";
import { getMeisterTaskColumnColor, getMeisterTaskColumnIcon } from "@/lib/meistertask-setup";
import type { Column as ColumnType, Task } from "@/types/api.types";
import type { DragEndEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Column } from "./column.org";

// Wrapper component to make columns sortable
function SortableColumn({ id, column, children }: { id: UniqueIdentifier; column: ColumnType; children: React.ReactElement }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement<any>, {
        listeners,
        isDragging,
      })}
    </div>
  );
}

interface BoardColumnsProps {
  boardId: string;
  isMeisterTask?: boolean;
}

export function BoardColumns({ boardId, isMeisterTask = false }: BoardColumnsProps) {
  const { columns, loading, refetch } = useColumns(boardId);
  const [sortedColumns, setSortedColumns] = useState<ColumnType[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);

  useEffect(() => {
    if (columns) {
      setSortedColumns(columns);
    }
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "Column") {
      setActiveColumn(active.data.current.column);
    } else {
      setActiveTask((active.data.current as { task?: Task })?.task ?? null);
    }
  };

  const handleAddColumn = async () => {
    if (!title.trim()) return;
    try {
      const position = sortedColumns.length;
      const columnData: any = { title, boardId, position };
      
      // Add MeisterTask styling if it's a MeisterTask board
      if (isMeisterTask) {
        columnData.color = getMeisterTaskColumnColor(title);
        columnData.icon = getMeisterTaskColumnIcon(title);
      }
      
      await columnsApi.createColumn(columnData);
      setTitle("");
      setAdding(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveColumn(null);

    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType === "Column") {
      // Handle column drag and drop
      const activeId = active.id;
      const overId = over.id;

      if (activeId !== overId) {
        setSortedColumns((currentColumns) => {
          const activeIndex = currentColumns.findIndex((c) => c.id === activeId);
          const overIndex = currentColumns.findIndex((c) => c.id === overId);
          const newOrder = arrayMove(currentColumns, activeIndex, overIndex);

          // Update positions for the backend
          const updates = newOrder.map((col, index) => ({
            id: col.id,
            position: index,
          }));
          columnsApi.updateColumnPositions(updates).catch((err) => {
            console.error("Failed to update column positions", err);
            // Optionally revert state on failure
            setSortedColumns(columns);
          });

          return newOrder;
        });
      }
    } else {
      // Handle task drag and drop
    const taskId = active.id as string;
    const sourceColumnId = (active.data.current as { columnId: string })?.columnId;
    const targetColumnId = (over.data.current as { columnId?: string })?.columnId || (over.id as string);

    if (!targetColumnId || targetColumnId === sourceColumnId) {
      return;
    }

    try {
      const targetColumn = columns.find((c: ColumnType) => c.id === targetColumnId);
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

          const interval: ReturnType<typeof setInterval> = setInterval(() => {
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
    }
  };

  const columnIds = sortedColumns.map((c) => c.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent ${isMeisterTask ? 'min-h-[600px]' : ''}`}>
        {loading ? (
          <div className="text-zinc-400 text-sm">Loading columns...</div>
        ) : sortedColumns.length === 0 ? (
          <div className="text-zinc-500 text-sm">No columns yet</div>
        ) : (
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {sortedColumns.map((col: ColumnType) => (
              <SortableColumn key={col.id} id={col.id} column={col}>
                <Column
                  column={col}
                  refreshToken={refreshToken}
                  onColumnDeleted={refetch}
                  onColumnUpdated={refetch}
                  isMeisterTask={isMeisterTask}
                />
              </SortableColumn>
            ))}
          </SortableContext>
        )}

        {/* Add column UI - Enhanced for MeisterTask */}
        {!isMeisterTask && (adding ? (
          <div className="w-72 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <input
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="Column title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
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
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeColumn ? (
          <Column
            key="active-column"
            column={activeColumn}
            onColumnDeleted={() => {}}
            onColumnUpdated={() => {}}
            isDragging
            isMeisterTask={isMeisterTask}
          />
        ) : activeTask ? (
          <div className={`bg-zinc-800/80 border border-teal-500 rounded-lg p-3 text-sm text-white w-64 pointer-events-none ${isMeisterTask ? 'shadow-lg' : ''}`}>
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
