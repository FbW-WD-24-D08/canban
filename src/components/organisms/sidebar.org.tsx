import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import {
  ChevronRight,
  Home,
  Settings,
  HelpCircle,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/button.comp";
import { boardsApi } from "@/api/boards.api";
import { useUserName } from "@/hooks/useUserName";
import { useBoardMembers } from "@/hooks/useBoardMembers";
import type { Board } from "@/types/api.types";
import { useNavigate } from "react-router";
import { MemberItem } from "@/components/atoms/member.comp";

interface SidebarProps {
  children: ReactNode;
  board?: Board;
  onDelete?: () => void;
}

export function Sidebar({ children, board, onDelete }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userName, loading: userLoading } = useUserName(board?.ownerId || "");
  const {
    members,
    loading: membersLoading,
    refetch: refetchMembers,
  } = useBoardMembers(board?.id || null);

  const handleDelete = async () => {
    if (!board || !confirm("Delete this board?")) return;
    try {
      await boardsApi.deleteBoard(board.id);
      onDelete?.();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMemberRemove = () => {
    refetchMembers();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 transition-all duration-300"
      >
        <ChevronRight
          className={`h-5 w-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Canban</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/help"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5 mr-3" />
                Help
              </Link>
            </li>
          </ul>
          {board && (
            <div className="mt-6 p-3 bg-zinc-800 rounded-lg space-y-3 text-sm">
              <div>
                <div className="text-zinc-400 text-xs mb-1">Updated</div>
                <div className="text-white">
                  {new Date(board.updatedAt).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-zinc-400 text-xs mb-1">
                  Members ({members.length})
                </div>
                <div className="text-white text-xs">
                  {membersLoading ? (
                    "Loading..."
                  ) : (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {members.map((member) => (
                        <MemberItem
                          key={member.id}
                          userId={member.userId}
                          boardId={board?.id}
                          ownerId={board?.ownerId}
                          onRemove={handleMemberRemove}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-1 text-red-400 hover:text-red-300 text-xs mt-3 py-2 hover:bg-zinc-700 rounded transition-colors"
              >
                <XCircle className="w-4 h-4" /> Delete board
              </button>
            </div>
          )}
        </nav>
      </div>
      <main className="w-full">{children}</main>
    </>
  );
}
