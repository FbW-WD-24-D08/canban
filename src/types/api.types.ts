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
  status?: "todo" | "in-progress" | "done";
  archived?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string; // uuid
  name: string;
  type: string; // mime type (e.g., "text/markdown", "image/png")
  url?: string; // optional URL for link attachments
  data?: string; // temporary base64 data for preview (auto-cleaned)
}

export interface CreateBoardData {
  title: string;
  description?: string;
}

export interface CreateColumnData {
  title: string;
  boardId: string;
  position?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  columnId: string;
  position?: number;
  status?: "todo" | "in-progress" | "done";
  attachments?: Attachment[];
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
  status?: "todo" | "in-progress" | "done";
  archived?: boolean;
  attachments?: Attachment[];
}

export interface UserName {
  id: string;
  username: string;
}

export interface UserEmail {
  id: string;
  email: string;
}
