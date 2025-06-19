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
  color?: string;
  icon?: string;
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
  priority?: Priority;
  assignees?: string[];
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  checklistItems?: ChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
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
  color?: string;
  icon?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  columnId: string;
  position?: number;
  status?: "todo" | "in-progress" | "done";
  attachments?: Attachment[];
  priority?: Priority;
  assignees?: string[];
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
  checklistItems?: ChecklistItem[];
}

export interface UpdateBoardData {
  title?: string;
  description?: string;
}

export interface UpdateColumnData {
  title?: string;
  position?: number;
  color?: string;
  icon?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  columnId?: string;
  position?: number;
  status?: "todo" | "in-progress" | "done";
  archived?: boolean;
  attachments?: Attachment[];
  priority?: Priority;
  assignees?: string[];
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  checklistItems?: ChecklistItem[];
}

export interface UserName {
  id: string;
  username: string;
}

export interface UserEmail {
  id: string;
  email: string;
}

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Tag {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
}

export interface CreateTagData {
  name: string;
  color: string;
  boardId: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}
