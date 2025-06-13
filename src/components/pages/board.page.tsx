import { useParams } from "react-router";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";
import { BoardColumns } from "../organisms/board-columns.org.tsx";
import { useBoard } from "../../hooks/useBoard.ts";
import { useUserContext } from "../contexts/user.context.tsx";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUserContext();
  const { board, loading, error, hasAccess } = useBoard(
    id || null,
    currentUser?.id || null
  );

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
          <div className="max-w-full px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-zinc-400 text-lg max-w-4xl">
                  {board.description}
                </p>
              )}
            </div>

            <BoardColumns boardId={board.id} />
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
