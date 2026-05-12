import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoardData, Task, SprintReport } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

const initialData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'React Projesi Kurulumu', type: 'Task', priority: 'High', statusId: 'todo', reporter: { id: 'user-1', name: 'İlker' }, createdAt: Date.now() },
    'task-2': { id: 'task-2', title: 'AeroFlow Sidebar Tasarımı', type: 'Story', priority: 'Medium', statusId: 'in-progress', reporter: { id: 'user-1', name: 'İlker' }, createdAt: Date.now() },
    'task-3': { id: 'task-3', title: 'Sürükle Bırak Hatası', type: 'Bug', priority: 'Highest', statusId: 'todo', reporter: { id: 'user-1', name: 'İlker' }, createdAt: Date.now() },
  },
  columns: {
    'todo': { id: 'todo', title: 'TO DO', taskIds: ['task-1', 'task-3'] },
    'in-progress': { id: 'in-progress', title: 'IN PROGRESS', taskIds: ['task-2'] },
    'done': { id: 'done', title: 'DONE', taskIds: [] },
  },
  columnOrder: ['todo', 'in-progress', 'done'],
};

interface BoardState {
  board: BoardData;
  activeTaskId: string | null;
  currentView: 'board' | 'reports' | 'settings';
  isSprintActive: boolean;
  sprintName: string;
  pastSprints: SprintReport[];
  searchQuery: string;
  isCreateModalOpen: boolean;
  
  moveTask: (taskId: string, sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => void;
  moveColumn: (sourceIndex: number, destIndex: number) => void;
  addTask: (title: string, columnId: string, extras?: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setActiveTask: (taskId: string | null) => void;
  setCurrentView: (view: 'board' | 'reports' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  
  startSprint: (name: string) => void;
  endSprint: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      board: initialData,
  activeTaskId: null,
  currentView: 'board',
  isSprintActive: false,
  sprintName: 'Sprint 1',
  pastSprints: [],
  searchQuery: '',
  isCreateModalOpen: false,
  
  moveTask: (taskId, sourceColId, destColId, sourceIndex, destIndex) => set((state) => {
    const newBoard = { ...state.board };
    
    if (sourceColId === destColId) {
      const column = newBoard.columns[sourceColId];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.splice(sourceIndex, 1);
      newTaskIds.splice(destIndex, 0, taskId);
      
      newBoard.columns[sourceColId] = { ...column, taskIds: newTaskIds };
      return { board: newBoard };
    }
    
    const sourceCol = newBoard.columns[sourceColId];
    const destCol = newBoard.columns[destColId];
    
    const sourceTaskIds = Array.from(sourceCol.taskIds);
    sourceTaskIds.splice(sourceIndex, 1);
    
    const destTaskIds = Array.from(destCol.taskIds);
    destTaskIds.splice(destIndex, 0, taskId);
    
    newBoard.columns[sourceColId] = { ...sourceCol, taskIds: sourceTaskIds };
    newBoard.columns[destColId] = { ...destCol, taskIds: destTaskIds };
    newBoard.tasks[taskId].statusId = destColId;
    
    return { board: newBoard };
  }),

  moveColumn: (sourceIndex, destIndex) => set((state) => {
    const newOrder = Array.from(state.board.columnOrder);
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destIndex, 0, removed);
    return { board: { ...state.board, columnOrder: newOrder } };
  }),

  addTask: (title, columnId, extras = {}) => set((state) => {
    const id = `task-${uuidv4()}`;
    const newTask: Task = {
      id,
      title,
      type: 'Task',
      priority: 'Medium',
      statusId: columnId,
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      ...extras
    };
    
    const newBoard = { ...state.board };
    newBoard.tasks[id] = newTask;
    newBoard.columns[columnId].taskIds.push(id);
    
    return { board: newBoard };
  }),

  updateTask: (taskId, updates) => set((state) => {
    const newBoard = { ...state.board };
    newBoard.tasks[taskId] = { ...newBoard.tasks[taskId], ...updates };
    return { board: newBoard };
  }),

  deleteTask: (taskId) => set((state) => {
    const newBoard = { ...state.board };
    
    Object.keys(newBoard.columns).forEach((colId) => {
      newBoard.columns[colId].taskIds = newBoard.columns[colId].taskIds.filter(id => id !== taskId);
    });
    
    delete newBoard.tasks[taskId];
    
    return { 
      board: newBoard,
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId 
    };
  }),

  setActiveTask: (taskId) => set({ activeTaskId: taskId }),
  setCurrentView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

  startSprint: (name) => set({ isSprintActive: true, sprintName: name }),
  
  endSprint: () => set((state) => {
    const { board, sprintName, pastSprints } = state;
    
    const doneTaskIds = board.columns['done'].taskIds;
    const completedTasks = doneTaskIds.length;
    
    let totalEstimated = 0;
    let totalLogged = 0;
    
    doneTaskIds.forEach(id => {
      const task = board.tasks[id];
      if (task.estimatedTime) totalEstimated += task.estimatedTime;
      if (task.loggedTime) totalLogged += task.loggedTime;
    });

    const uncompletedTasks = board.columns['todo'].taskIds.length + board.columns['in-progress'].taskIds.length;
    
    let deviationPercent = 0;
    if (totalEstimated > 0) {
      deviationPercent = Math.round(((totalLogged - totalEstimated) / totalEstimated) * 100);
    }

    const report: SprintReport = {
      id: `sprint-${uuidv4()}`,
      name: sprintName,
      completedTasks,
      uncompletedTasks,
      totalEstimated,
      totalLogged,
      deviationPercent,
      endDate: Date.now()
    };

    const newBoard = { ...board };
    newBoard.columns = {
      ...newBoard.columns,
      'done': { ...newBoard.columns['done'], taskIds: [] }
    };

    return {
      isSprintActive: false,
      pastSprints: [...pastSprints, report],
      board: newBoard,
      sprintName: `Sprint ${pastSprints.length + 2}`
    };
  })
    }),
    {
      name: 'aeroflow-board-storage',
    }
  )
);
