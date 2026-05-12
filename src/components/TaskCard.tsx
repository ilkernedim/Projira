import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../interfaces';
import { twMerge } from 'tailwind-merge';
import { useBoardStore } from '../store/useBoardStore';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const setActiveTask = useBoardStore(state => state.setActiveTask);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Highest':
      case 'High':
        return 'bg-error/10 text-error';
      case 'Medium':
        return 'bg-secondary/10 text-secondary';
      case 'Low':
      case 'Lowest':
        return 'bg-surface-container-highest text-on-surface-variant';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  const getCardStyle = () => {
    let style = "glass-card p-md rounded-lg hover:-translate-y-0.5 transition-transform ";
    if (task.statusId === 'in-progress') {
      style += "border-l-2 border-l-primary shadow-[0_4px_12px_rgba(0,0,0,0.2)]";
    }
    if (task.statusId === 'done') {
      style += "bg-surface-container-lowest/30 border-white/5 opacity-70";
    }
    return style;
  };

  const isDone = task.statusId === 'done';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setActiveTask(task.id)}
          className={twMerge(
            getCardStyle(),
            snapshot.isDragging && 'rotate-2 shadow-2xl z-50 opacity-100 ring-1 ring-primary/50'
          )}
        >
          <div className="flex justify-between items-start mb-sm">
            <span className={`font-code text-code ${isDone ? 'text-outline/50 line-through' : 'text-outline'}`}>
              {task.id.replace('task-', 'PROJ-').toUpperCase()}
            </span>
            <span className={`${getPriorityStyle(task.priority)} text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded`}>
              {task.priority}
            </span>
          </div>
          
          <h3 className={`font-body-lg text-body-lg leading-tight ${isDone ? 'text-on-surface-variant line-through decoration-outline/50' : 'text-on-surface'} ${task.description ? 'mb-xs' : 'mb-md'}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2 mb-md">
              {task.description}
            </p>
          )}

          <div className={`flex items-center justify-between mt-auto ${task.description || isDone ? 'pt-sm border-t border-white/5' : ''}`}>
            <div className={`flex gap-sm ${isDone ? 'text-surface-variant' : 'text-on-surface-variant'}`}>
              {isDone ? (
                <span className="material-symbols-outlined text-[16px] text-primary/80">check_circle</span>
              ) : (
                <>
                  <div className="flex items-center gap-xs text-[12px]">
                    <span className="material-symbols-outlined text-[14px]">
                      {task.type === 'Story' ? 'bookmark' : task.type === 'Bug' ? 'bug_report' : 'check_box'}
                    </span>
                  </div>
                  {task.estimatedTime && (
                    <div className="flex items-center gap-xs text-[12px]">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {task.estimatedTime}h
                    </div>
                  )}
                </>
              )}
            </div>
            
            {task.reporter?.avatarUrl ? (
              <img 
                alt="Assignee" 
                className={`w-6 h-6 rounded-full object-cover border border-white/10 ${isDone ? 'opacity-60' : ''}`}
                src={task.reporter.avatarUrl} 
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white font-bold">
                İL
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
