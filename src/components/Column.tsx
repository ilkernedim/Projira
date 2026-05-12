import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { Column as ColumnType, Task } from '../interfaces';
import TaskCard from './TaskCard';
import { useBoardStore } from '../store/useBoardStore';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export default function Column({ column, tasks }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const addTask = useBoardStore(state => state.addTask);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, column.id);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const getBadgeStyle = () => {
    if (column.id === 'in-progress') return "bg-primary/20 text-primary border border-primary/30";
    return "bg-surface-container-high text-on-surface-variant";
  };

  return (
    <div className={`flex flex-col w-[320px] shrink-0 h-full ${column.id === 'done' ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between mb-sm px-sm">
        <div className="flex items-center gap-sm">
          <h2 className="font-h2 text-h2 text-on-surface">{column.title}</h2>
          <span className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full ${getBadgeStyle()}`}>
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 overflow-y-auto pr-2 pb-lg space-y-md custom-scrollbar ${snapshot.isDraggingOver ? 'bg-surface-container-lowest/50 rounded-lg' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !isAdding && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center p-md border-2 border-dashed border-white/5 rounded-xl h-[120px] opacity-60">
                <span className="material-symbols-outlined text-on-surface-variant mb-1">note_stack</span>
                <span className="text-on-surface-variant font-label-sm">Drop tasks here</span>
              </div>
            )}

            {isAdding && (
              <div className="glass-card p-md rounded-lg">
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  onBlur={() => {
                    if (!newTaskTitle.trim()) setIsAdding(false);
                  }}
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface text-body-md focus:outline-none focus:border-primary"
                  placeholder="What needs to be done?"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={handleAddTask}
                    className="bg-primary text-on-primary text-xs font-medium px-2 py-1 rounded hover:bg-primary-fixed transition-colors"
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="text-on-surface-variant hover:text-on-surface text-xs font-medium px-2 py-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
