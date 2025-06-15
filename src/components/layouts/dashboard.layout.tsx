import { Outlet, useLocation } from "react-router";
import { Sidebar } from "../organisms/sidebar.org";
import { useBoard } from "@/hooks/useBoard";
import { useUser } from "@clerk/clerk-react";

export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useUser();
  const isBoardPage = location.pathname.startsWith("/dashboard/board/");
  const boardId = isBoardPage
    ? location.pathname.split("/dashboard/board/")[1]
    : null;
  const { board } = useBoard(boardId, user?.id || null);

  return (
    <>
      <Sidebar board={isBoardPage && board ? board : undefined}>
        <Outlet />
      </Sidebar>
    </>
  );
}
