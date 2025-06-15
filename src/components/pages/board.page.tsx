import { boardsApi } from "@/api/boards.api";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useBoard } from "../../hooks/useBoard.ts";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { useUserContext } from "../contexts/user.context.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";
import { BoardColumns } from "../organisms/board-columns.org.tsx";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUserContext();
  const { board, loading, error, hasAccess } = useBoard(
    id || null,
    currentUser?.id || null
  );

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDesc(board.description || "");
    }
  }, [board]);

  const saveBoard = async () => {
    if (!board) return;
    try {
      await boardsApi.updateBoard(board.id, { title, description: desc });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <MetaTags
          title="Loading Board | Canban"
          desc="Loading board details..."
          bots={false}
        />
        <DefaultLayout>
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-zinc-400">Loading board...</div>
          </div>
        </DefaultLayout>
      </>
    );
  }
  if (error || !board) {
    const isAccessDenied = hasAccess === false;

    return (
      <>
        <MetaTags
          title={
            isAccessDenied
              ? "Access Denied | Canban"
              : "Board Not Found | Canban"
          }
          desc={
            isAccessDenied
              ? "You don't have access to this board."
              : "The requested board could not be found."
          }
          bots={false}
        />
        <DefaultLayout>
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`text-lg mb-2 ${
                  isAccessDenied ? "text-orange-400" : "text-red-400"
                }`}
              >
                {isAccessDenied ? "Access Denied" : "Board Not Found"}
              </div>
              <div className="text-zinc-500">
                {isAccessDenied
                  ? "You are not a member of this board and cannot access it."
                  : "The board you're looking for doesn't exist."}
              </div>
            </div>
          </div>
        </DefaultLayout>
      </>
    );
  }

  return (
    <>
      <MetaTags
        title={`${board.title} | Canban`}
        desc={board.description || "Kanban board for project management"}
        bots={false}
      />
      <DefaultLayout>
        <div className="min-h-screen bg-zinc-950">
          <div className="flex">
            <div className="flex-1 min-w-0 px-6 py-8">
              <div className="mb-8">
                {editingTitle ? (
                  <input
                    className="text-3xl md:text-4xl font-bold bg-transparent outline-none border-b border-teal-500 text-white mb-2 w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      setEditingTitle(false);
                      saveBoard();
                    }}
                    autoFocus
                    placeholder="Board title"
                  />
                ) : (
                  <h1
                    className="text-3xl md:text-4xl font-bold text-white mb-2 cursor-pointer"
                    onClick={() => setEditingTitle(true)}
                  >
                    {title}
                  </h1>
                )}
                {editingDesc ? (
                  <textarea
                    className="w-full bg-transparent border border-teal-500 rounded-md p-2 text-zinc-300 focus:outline-none"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    onBlur={() => {
                      setEditingDesc(false);
                      saveBoard();
                    }}
                    rows={3}
                    autoFocus
                    placeholder="Board description"
                  />
                ) : desc ? (
                  <p
                    className="text-zinc-400 max-w-4xl cursor-pointer"
                    onClick={() => setEditingDesc(true)}
                  >
                    {desc}
                  </p>
                ) : (
                  <p
                    className="text-zinc-500 text-sm cursor-pointer"
                    onClick={() => setEditingDesc(true)}
                  >
                    Add description...
                  </p>
                )}
              </div>
              <BoardColumns boardId={board.id} />
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
