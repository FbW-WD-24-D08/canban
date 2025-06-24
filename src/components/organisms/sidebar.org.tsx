import { boardsApi } from "@/api/boards.api";
import { Button } from "@/components/atoms/button.comp";
import {
    ChevronRight,
    HelpCircle,
    Home,
    Settings,
    X,
    XCircle,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router-dom";

import { MemberItem } from "@/components/atoms/member.comp";
import { useBoardMembers } from "@/hooks/useBoardMembers";
import { useClerkSync } from "@/hooks/useClerkSync";
import type { Board } from "@/types/api.types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddMemberSimple } from "../atoms/add-member-simple.comp";
import { useToast } from "../contexts/toast.context";
import { useUserContext } from "../contexts/user.context.tsx";
import { DeleteConfirmationModal } from "../molecules/confirmation-modal.comp";

interface SidebarProps {
  children: ReactNode;
  board?: Board;
  onDelete?: () => void;
}

export function Sidebar({ children, board, onDelete }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const isUserOwner = board?.ownerId === currentUser?.id;
  const toast = useToast();

  // Clerk organization sync
  const { 
    syncAllOrganizationMembers, 
    isLoaded, 
    clerkOrganization, 
    orgLoaded
  } = useClerkSync();

  const {
    members,
    loading: membersLoading,
    refetch: refetchMembers,
  } = useBoardMembers(board?.id || null);

  // Auto-sync all Clerk organization members when component loads
  useEffect(() => {
    if (isLoaded && orgLoaded && clerkOrganization && board?.id === "14e1") {
      syncAllOrganizationMembers();
    }
  }, [isLoaded, orgLoaded, clerkOrganization?.id, board?.id, syncAllOrganizationMembers]);

  const handleDelete = async () => {
    if (!board) return;
    try {
      setDeleting(true);
      await boardsApi.deleteBoard(board.id);
      toast.success("Board deleted", "The board has been permanently deleted.");
      onDelete?.();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed", "Could not delete the board. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 sm:top-16 sm:bottom-auto sm:right-auto sm:left-4 z-[60] bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600 transition-all duration-300 backdrop-blur-sm shadow-lg"
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
                          onRemove={refetchMembers}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isUserOwner && (
                <>
                  <AddMemberSimple
                    boardId={board?.id}
                    onMemberAdded={refetchMembers}
                  />
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-1 text-red-400 hover:text-red-300 text-xs mt-3 py-2 hover:bg-zinc-700 rounded transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Delete board
                  </button>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
      <main className="w-full">{children}</main>
      
      {board && (
        <DeleteConfirmationModal
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={handleDelete}
          itemName={board.title}
          itemType="board"
          loading={deleting}
        />
      )}
    </>
  );
}
