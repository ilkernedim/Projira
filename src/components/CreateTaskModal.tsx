import { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import type { TaskType, Priority } from '../interfaces';

export default function CreateTaskModal() {
  const { isCreateModalOpen, setCreateModalOpen, addTask } = useBoardStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Task');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [estimatedTime, setEstimatedTime] = useState<number | ''>('');

  if (!isCreateModalOpen) return null;

  const handleCreate = () => {
    if (!title.trim()) return;
    
    addTask(title, 'todo', {
      type,
      priority,
      description,
      estimatedTime: estimatedTime ? Number(estimatedTime) : undefined
    });
    
    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setType('Task');
    setPriority('Medium');
    setEstimatedTime('');
  };

  const getIconForType = (t: TaskType) => {
    if (t === 'Story') return 'bookmark';
    if (t === 'Bug') return 'bug_report';
    return 'check_circle';
  };

  const getIconColorForType = (t: TaskType) => {
    if (t === 'Story') return 'text-primary';
    if (t === 'Bug') return 'text-error';
    return 'text-primary';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/40 backdrop-blur-[2px]">
      <div className="glass-panel w-full max-w-[720px] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden bg-[#16171A]/85 border border-white/10">
        
        <div className="flex items-center justify-between p-lg border-b border-white/10 bg-[#16171A]/80">
          <h2 className="font-h1 text-h1 text-on-surface">Create Issue</h2>
          <button 
            onClick={() => setCreateModalOpen(false)}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-sm rounded-full hover:bg-white/5 active:scale-95"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-lg overflow-y-auto flex flex-col gap-lg custom-scrollbar text-left">
          
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Project Selection <span className="text-error">*</span></label>
              <div className="relative">
                <select className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg py-sm pl-md pr-xl text-body-md text-on-surface appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
                  <option>Projira (PRO)</option>
                  <option>Project Beta (BET)</option>
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Issue Type <span className="text-error">*</span></label>
              <div className="relative">
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg py-sm pl-xl pr-xl text-body-md text-on-surface appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                >
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Story">Story</option>
                  <option value="Epic">Epic</option>
                </select>
                <span className={`material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 ${getIconColorForType(type)} pointer-events-none text-[20px]`}>
                  {getIconForType(type)}
                </span>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full"></div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Summary <span className="text-error">*</span></label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg p-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/50" 
              placeholder="Short description of the issue" 
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Description</label>
            <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0B0C0E] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="flex items-center gap-xs p-sm border-b border-white/10 bg-[#16171A]/50">
                <button className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                <button className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                <button className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">link</span></button>
                <div className="w-px h-4 bg-white/10 mx-xs"></div>
                <button className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                <button className="p-xs text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">format_list_numbered</span></button>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent border-none p-md text-body-md text-on-surface focus:ring-0 resize-none placeholder:text-on-surface-variant/50 outline-none" 
                placeholder="Add detailed description..." 
                rows={4}
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Priority</label>
              <div className="relative">
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg py-sm pl-xl pr-xl text-body-md text-on-surface appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                >
                  <option value="Highest">Highest</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Lowest">Lowest</option>
                </select>
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-tertiary pointer-events-none text-[20px]">menu</span>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Estimated Time (h)</label>
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg py-sm pl-xl pr-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/50" 
                  placeholder="e.g. 5"
                />
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">schedule</span>
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-md p-lg border-t border-white/10 bg-[#16171A]/80 mt-auto">
          <button 
            onClick={() => setCreateModalOpen(false)}
            className="px-md py-sm rounded border border-white/10 text-on-surface hover:bg-white/5 transition-colors font-label-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-md py-sm rounded bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}
