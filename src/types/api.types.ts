export interface Board {
  id: number;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: number;
  boardId: number;
  userId: string;
}

export interface Column {
  id: number;
  title: string;
  boardId: number;
  position: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  columnId: number;
  position: number;
}

export interface CreateBoardData {
  title: string;
  description?: string;
}

export interface CreateColumnData {
  title: string;
  boardId: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  columnId: number;
}

export interface UpdateBoardData {
  title?: string;
  description?: string;
}

export interface UpdateColumnData {
  title?: string;
  position?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  columnId?: number;
  position?: number;
}
