import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '../store/useBoardStore';
import Column from '../components/Column';
import TaskModal from '../components/TaskModal';

export default function Board() {
  const { board, moveTask, isSprintActive, sprintName, startSprint, endSprint, searchQuery, setCreateModalOpen } = useBoardStore();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      
      <div className="px-lg py-md flex flex-wrap items-center justify-between gap-md shrink-0 border-b border-white/5 bg-surface-container-lowest/50">
        <div className="flex items-center gap-sm">
          <button className="glass-card px-md py-1.5 rounded-DEFAULT text-on-surface font-body-md text-body-md hover:bg-surface-container-high transition-colors flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Only My Issues
          </button>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary text-on-primary font-body-md text-body-md font-medium px-md py-1.5 rounded-DEFAULT hover:bg-primary-fixed transition-colors active:scale-95 duration-200"
          >
            Create
          </button>
          
          <div className="ml-md">
            {!isSprintActive ? (
              <button 
                onClick={() => startSprint(sprintName)}
                className="bg-primary text-on-primary font-body-md text-body-md font-medium px-md py-1.5 rounded-DEFAULT hover:bg-primary-fixed transition-colors active:scale-95 duration-200"
              >
                Start Sprint
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (window.confirm('Bu sprinti tamamlamak istediğinize emin misiniz? Tüm DONE kolonundaki görevler arşive kalkacak ve istatistikler kaydedilecek.')) {
                    endSprint();
                  }
                }}
                className="bg-surface-container-highest hover:bg-surface-bright border border-white/10 text-on-surface font-body-md text-body-md font-medium px-md py-1.5 rounded-DEFAULT transition-colors active:scale-95 duration-200"
              >
                Complete {sprintName}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <button className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-DEFAULT transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-lg flex gap-lg items-start relative z-10 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          {board.columnOrder.map((columnId) => {
            const column = board.columns[columnId];
            const tasks = column.taskIds
              .map((taskId) => board.tasks[taskId])
              .filter(task => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return task.title.toLowerCase().includes(q) || 
                       (task.description && task.description.toLowerCase().includes(q));
              });

            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </DragDropContext>
        <div className="w-lg shrink-0"></div>
      </div>

      <TaskModal />
    </div>
  );
}
