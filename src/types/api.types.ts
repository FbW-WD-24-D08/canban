export interface Board {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
}

export interface CreateBoardData {
  title: string;
  description?: string;
}

export interface CreateColumnData {
  title: string;
  boardId: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  columnId: string;
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
  columnId?: string;
  position?: number;
}
