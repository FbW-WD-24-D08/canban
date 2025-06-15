import { useState } from "react";
import { useNavigate } from "react-router";
import { siteConfig } from "../../config/site.ts";
import { useBoards } from "../../hooks/useBoards.ts";
import { useBoardSorting } from "../../hooks/useBoardSorting.ts";
import { usePagination } from "../../hooks/usePagination.ts";
import type { Board } from "../../types/api.types.ts";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { useUserContext } from "../contexts/user.context.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";
import { CreateBoardDialog } from "../molecules/create-board-dialog.comp";
import { BoardList } from "../organisms/board-list.org.tsx";
import { BoardToolbar } from "../organisms/board-toolbar.org.tsx";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const { boards, loading, refetch } = useBoards(currentUser?.id || null);
  const { sortBy, sortOrder, sortedBoards, handleSortChange } =
    useBoardSorting(boards);
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBoards,
    handlePageChange,
    resetPage,
  } = usePagination(sortedBoards, 20);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSortChangeWithReset = (
    newSortBy: "title" | "date",
    newSortOrder: "asc" | "desc"
  ) => {
    handleSortChange(newSortBy, newSortOrder);
    resetPage();
  };
  const handleBoardClick = (board: Board) => {
    navigate(`/dashboard/board/${board.id}`);
  };

  const handleBoardCreated = () => {
    refetch();
  };

  const openCreateDialog = () => {
    setDialogOpen(true);
  };

  const userName = currentUser?.name || "User";

  return (
    <>
      <MetaTags
        title={siteConfig.meta.dashboard.title}
        desc={siteConfig.meta.dashboard.desc}
        bots={siteConfig.meta.dashboard.bots}
        keywords={siteConfig.meta.dashboard.keywords}
      />
      <DefaultLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-zinc-400">
              Manage your boards and stay organized
            </p>
          </div>{" "}
          <BoardToolbar
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChangeWithReset}
            onCreateBoard={openCreateDialog}
          />
          {loading ? (
            <div className="text-center py-12">
              <div className="text-zinc-400">Loading boards...</div>
            </div>
          ) : (
            <BoardList
              boards={paginatedBoards}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onBoardClick={handleBoardClick}
            />
          )}
          <CreateBoardDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            ownerId={currentUser?.id || ""}
            onBoardCreated={handleBoardCreated}
          />
        </div>
      </DefaultLayout>
    </>
  );
}
