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
    <div className="board-page flex-1 flex flex-col h-full overflow-hidden bg-background">

      <div className="px-lg py-md flex flex-wrap items-center justify-between gap-md shrink-0 border-b border-white/5 bg-surface-container-lowest/50">
        <div className="flex items-center gap-sm">
          <span className="text-on-surface-variant text-body-md">Görevleri sürükleyin, ayrıntıları açmak için tıklayın.</span>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary text-on-primary font-body-md text-body-md font-medium px-md py-1.5 rounded-DEFAULT hover:bg-primary-fixed transition-colors active:scale-95 duration-200"
          >
            Yeni görev
          </button>

          <div className="ml-md">
            {!isSprintActive ? (
              <button
                onClick={() => startSprint(sprintName)}
                className="bg-primary text-on-primary font-body-md text-body-md font-medium px-md py-1.5 rounded-DEFAULT hover:bg-primary-fixed transition-colors active:scale-95 duration-200"
              >
                Çalışma dönemini başlat
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm('Bu çalışma dönemini tamamlamak istediğinize emin misiniz? Tamamlandı sütunundaki görevler arşivlenecek ve istatistikler kaydedilecek.')) {
                    endSprint();
                  }
                }}
                className="bg-surface-container-highest hover:bg-surface-bright border border-white/10 text-on-surface font-body-md text-body-md font-medium px-md py-1.5 rounded-DEFAULT transition-colors active:scale-95 duration-200"
              >
                Dönemi tamamla
              </button>
            )}
          </div>
        </div>

      </div>

      <div className="board-columns flex-1 overflow-x-auto overflow-y-hidden p-lg flex gap-lg items-start relative z-10 custom-scrollbar">
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

      </div>

      <TaskModal />
    </div>
  );
}
