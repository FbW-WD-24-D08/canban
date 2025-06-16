import type {
  Board,
  BoardMember,
  Column,
  CreateBoardData,
  Task,
  UpdateBoardData,
} from "@/types/api.types";
import { apiClient } from "./client";

export const boardsApi = {
  getUserBoards: async (clerkUserId: string): Promise<Board[]> => {
    try {
      const memberships: BoardMember[] = await apiClient.get(
        `/boardMembers?userId=${clerkUserId}`
      );

      if (memberships.length === 0) {
        return [];
      }

      const boardIds = memberships.map((m) => m.boardId);
      const boardsPromises = boardIds.map((id) =>
        apiClient.get(`/boards/${id}`)
      );

      return Promise.all(boardsPromises);
    } catch (error) {
      console.error("Error fetching user boards:", error);
      throw error;
    }
  },
  getBoardById: async (boardId: string): Promise<Board> => {
    try {
      return await apiClient.get(`/boards/${boardId}`);
    } catch (error) {
      console.error(`Error fetching board ${boardId}:`, error);
      throw error;
    }
  },

  createBoard: async (
    data: CreateBoardData,
    ownerId: string
  ): Promise<Board> => {
    try {
      const now = new Date().toISOString();

      const board: Board = await apiClient.post("/boards", {
        ...data,
        ownerId,
        createdAt: now,
        updatedAt: now,
      });

      await apiClient.post("/boardMembers", {
        boardId: board.id,
        userId: ownerId,
      });

      return board;
    } catch (error) {
      console.error("Error creating board:", error);
      throw error;
    }
  },
  updateBoard: async (
    boardId: string,
    data: UpdateBoardData
  ): Promise<Board> => {
    try {
      const currentBoard = await apiClient.get(`/boards/${boardId}`);

      return await apiClient.put(`/boards/${boardId}`, {
        ...currentBoard,
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error updating board ${boardId}:`, error);
      throw error;
    }
  },
  deleteBoard: async (boardId: string): Promise<void> => {
    try {
      const columns: Column[] = await apiClient.get(
        `/columns?boardId=${boardId}`
      );

      const columnIds = columns.map((c) => c.id);
      const allTasks: Task[] = [];

      for (const columnId of columnIds) {
        const tasks: Task[] = await apiClient.get(
          `/tasks?columnId=${columnId}`
        );
        allTasks.push(...tasks);
      }

      const memberships: BoardMember[] = await apiClient.get(
        `/boardMembers?boardId=${boardId}`
      );

      const deleteTaskPromises = allTasks.map((task) =>
        apiClient.delete(`/tasks/${task.id}`)
      );

      const deleteColumnPromises = columns.map((column) =>
        apiClient.delete(`/columns/${column.id}`)
      );

      const deleteMemberPromises = memberships.map((membership) =>
        apiClient.delete(`/boardMembers/${membership.id}`)
      );

      await Promise.all([
        ...deleteTaskPromises,
        ...deleteColumnPromises,
        ...deleteMemberPromises,
      ]);

      await apiClient.delete(`/boards/${boardId}`);
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw error;
    }
  },

  checkAccess: async (
    boardId: string,
    clerkUserId: string
  ): Promise<boolean> => {
    try {
      const memberships: BoardMember[] = await apiClient.get(
        `/boardMembers?boardId=${boardId}&userId=${clerkUserId}`
      );
      return memberships.length > 0;
    } catch (error) {
      console.error("Error checking board access:", error);
      return false;
    }
  },

  getBoardMembers: async (boardId: string): Promise<BoardMember[]> => {
    try {
      return await apiClient.get(`/boardMembers?boardId=${boardId}`);
    } catch (error) {
      console.error("Error fetching board members:", error);
      throw error;
    }
  },

  addMember: async (boardId: string, userId: string): Promise<BoardMember> => {
    try {
      return await apiClient.post("/boardMembers", {
        boardId,
        userId,
      });
    } catch (error) {
      console.error("Error adding board member:", error);
      throw error;
    }
  },

  removeMember: async (boardId: string, userId: string): Promise<void> => {
    try {
      const memberships: BoardMember[] = await apiClient.get(
        `/boardMembers?boardId=${boardId}&userId=${userId}`
      );

      if (memberships.length > 0) {
        await apiClient.delete(`/boardMembers/${memberships[0].id}`);
      }
    } catch (error) {
      console.error("Error removing board member:", error);
      throw error;
    }
  },
};
