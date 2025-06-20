import { apiClient } from "./client";
import type {
  Board,
  BoardMember,
  CreateBoardData,
  UpdateBoardData,
} from "../types/api.types";

export const boardsApi = {
  getUserBoards: async (clerkUserId: string): Promise<Board[]> => {
    return apiClient.get<Board[]>(`/boards?userId=${clerkUserId}`);
  },

  getBoardById: async (boardId: string): Promise<Board> => {
    return apiClient.get<Board>(`/boards/${boardId}`);
  },

  createBoard: async (
    data: CreateBoardData,
    ownerId: string
  ): Promise<Board> => {
    return apiClient.post<Board>("/boards", { ...data, ownerId });
  },

  updateBoard: async (
    boardId: string,
    data: UpdateBoardData
  ): Promise<Board> => {
    return apiClient.put<Board>(`/boards/${boardId}`, data);
  },

  deleteBoard: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`);
  },

  checkAccess: async (
    boardId: string,
    clerkUserId: string
  ): Promise<boolean> => {
    try {
      await apiClient.get(`/boards/${boardId}/access?userId=${clerkUserId}`);
      return true;
    } catch {
      return false;
    }
  },

  getBoardMembers: async (boardId: string): Promise<BoardMember[]> => {
    return apiClient.get<BoardMember[]>(`/boards/${boardId}/members`);
  },

  addMember: async (boardId: string, userId: string): Promise<BoardMember> => {
    return apiClient.post<BoardMember>(`/boards/${boardId}/members`, {
      userId,
    });
  },

  removeMember: async (boardId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/members/${userId}`);
  },
};

export default boardsApi;
