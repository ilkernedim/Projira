export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
export type TaskType = 'Epic' | 'Story' | 'Task' | 'Bug';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  statusId: string;
  assignee?: User;
  reporter: User;
  createdAt: number;
  estimatedTime?: number;
  loggedTime?: number;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export interface SprintReport {
  id: string;
  name: string;
  completedTasks: number;
  uncompletedTasks: number;
  totalEstimated: number;
  totalLogged: number;
  deviationPercent: number;
  endDate: number;
}
