import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoardData, Task, SprintReport } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { ornekPano, ornekSprintler } from '../data/seed';

// başlangıç verisi src/data/seed.ts içinde, DENG-AI demosu için 5 kişilik örnek ekip ve 6 sprintlik geçmiş

interface BoardState {
  board: BoardData;
  activeTaskId: string | null;
  currentView: 'overview' | 'board' | 'reports' | 'dengai' | 'jury' | 'settings';
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
  setCurrentView: (view: 'overview' | 'board' | 'reports' | 'dengai' | 'jury' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  
  startSprint: (name: string) => void;
  endSprint: () => void;
  resetDemo: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      board: ornekPano(),
  activeTaskId: null,
  currentView: 'overview',
  isSprintActive: true,
  sprintName: 'Sprint 7',
  pastSprints: ornekSprintler(),
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

  resetDemo: () => set({
    board: ornekPano(),
    pastSprints: ornekSprintler(),
    isSprintActive: true,
    sprintName: 'Sprint 7',
    activeTaskId: null,
    searchQuery: '',
  }),
  
  endSprint: () => set((state) => {
    const { board, sprintName, pastSprints } = state;
    
    const doneTaskIds = board.columns['done'].taskIds;
    const completedTasks = doneTaskIds.length;
    
    let totalEstimated = 0;
    let totalLogged = 0;
    
    const memberStats: Record<string, { estimated: number; logged: number }> = {};

    doneTaskIds.forEach(id => {
      const task = board.tasks[id];
      if (task.estimatedTime) totalEstimated += task.estimatedTime;
      if (task.loggedTime) totalLogged += task.loggedTime;
      // kişi bazlı kayıt, DENG-AI kişinin gerçek hızını buradan öğrenir
      if (task.assignee && task.estimatedTime) {
        const kayit = memberStats[task.assignee.id] ?? { estimated: 0, logged: 0 };
        kayit.estimated += task.estimatedTime;
        kayit.logged += task.loggedTime ?? task.estimatedTime;
        memberStats[task.assignee.id] = kayit;
      }
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
      endDate: Date.now(),
      memberStats
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
      name: 'projira-board-storage-v2',
    }
  )
);
