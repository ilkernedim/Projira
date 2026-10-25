import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoardData, Task, SprintReport } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

const initialData: BoardData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Müşteri Dashboard Tasarımı',
      description: 'Yönetim panelinde anlık satış, kullanıcı ve gelir grafikleri içeren modern bir dashboard tasarlanacak.',
      type: 'Story',
      priority: 'High',
      statusId: 'todo',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 16,
    },
    'task-2': {
      id: 'task-2',
      title: 'Login Sayfasında Şifre Sıfırlama Hatası',
      description: 'Şifre sıfırlama e-postası bazı kullanıcılara ulaşmıyor. SMTP yapılandırması ve hata loglarının incelenmesi gerekiyor.',
      type: 'Bug',
      priority: 'Highest',
      statusId: 'todo',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 4,
    },
    'task-3': {
      id: 'task-3',
      title: 'API Dokümantasyonu Hazırla',
      description: 'Geliştirici ekibi için tüm endpoint\'leri kapsayan Swagger dokümantasyonu oluşturulacak.',
      type: 'Task',
      priority: 'Low',
      statusId: 'todo',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 6,
    },
    'task-4': {
      id: 'task-4',
      title: 'Bildirim Sistemi Entegrasyonu',
      description: 'Kullanıcılara e-posta ve uygulama içi anlık bildirim gönderebilen merkezi bir bildirim servisi geliştirilecek.',
      type: 'Story',
      priority: 'High',
      statusId: 'in-progress',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 12,
      loggedTime: 5,
    },
    'task-5': {
      id: 'task-5',
      title: 'Sayfa Yüklenme Performansı Optimizasyonu',
      description: 'Lighthouse skorunu yükseltmek için görsellerin lazy-load edilmesi ve bundle boyutunun küçültülmesi.',
      type: 'Task',
      priority: 'Medium',
      statusId: 'in-progress',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 8,
      loggedTime: 3,
    },
    'task-6': {
      id: 'task-6',
      title: 'Kullanıcı Profil Sayfası',
      description: 'Kullanıcıların profil bilgilerini ve avatarlarını güncelleyebileceği sayfa tamamlandı.',
      type: 'Story',
      priority: 'Medium',
      statusId: 'done',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 6,
      loggedTime: 6,
    },
    'task-7': {
      id: 'task-7',
      title: 'Veritabanı Yedekleme Sistemi',
      description: 'Otomatik günlük yedekleme cron job\'u kuruldu ve test edildi.',
      type: 'Task',
      priority: 'High',
      statusId: 'done',
      reporter: { id: 'user-1', name: 'İlker' },
      createdAt: Date.now(),
      estimatedTime: 5,
      loggedTime: 4,
    },
  },
  columns: {
    'todo': { id: 'todo', title: 'TO DO', taskIds: ['task-2', 'task-1', 'task-3'] },
    'in-progress': { id: 'in-progress', title: 'IN PROGRESS', taskIds: ['task-4', 'task-5'] },
    'done': { id: 'done', title: 'DONE', taskIds: ['task-6', 'task-7'] },
  },
  columnOrder: ['todo', 'in-progress', 'done'],
};

interface BoardState {
  board: BoardData;
  activeTaskId: string | null;
  currentView: 'board' | 'reports' | 'dengai' | 'settings';
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
  setCurrentView: (view: 'board' | 'reports' | 'dengai' | 'settings') => void;
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
      name: 'projira-board-storage',
    }
  )
);
