import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../interfaces';
import { twMerge } from 'tailwind-merge';
import { useBoardStore } from '../store/useBoardStore';
import { TAKIM } from '../data/ekip';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const setActiveTask = useBoardStore(state => state.setActiveTask);

  const getCardStyle = () => {
    let style = "task-card glass-card p-md rounded-xl transition-colors ";
    if (task.statusId === 'in-progress') {
      style += "border-l-2 border-l-primary";
    }
    if (task.statusId === 'done') {
      style += "bg-surface-container-lowest/30 border-white/5";
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
                      {task.estimatedTime} sa.
                    </div>
                  )}
                </>
              )}
            </div>

            {task.assignee ? (
              <div
                className={`px-2 py-1 rounded-full flex items-center justify-center text-[12px] text-white font-medium ${isDone ? 'opacity-60' : ''}`}
                style={{ background: TAKIM.find((u) => u.id === task.assignee?.id)?.renk ?? '#8b90a0' }}
                title={task.assignee.name}
              >
                {task.assignee.name}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-dashed border-on-surface-variant/60 flex items-center justify-center text-[11px] text-on-surface-variant" title="Atanmamış">
                ?
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
