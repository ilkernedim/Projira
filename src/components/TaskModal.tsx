import { useState, useEffect } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import type { TaskType, Comment } from '../interfaces';

export default function TaskModal() {
  const { board, activeTaskId, setActiveTask, updateTask } = useBoardStore();
  const task = activeTaskId ? board.tasks[activeTaskId] : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimated, setEstimated] = useState<number | ''>('');
  const [logged, setLogged] = useState<number | ''>('');

  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setEstimated(task.estimatedTime || '');
      setLogged(task.loggedTime || '');
    }
  }, [task]);

  if (!task) return null;

  const getTaskIcon = (type: TaskType) => {
    if (type === 'Story') return 'bookmark';
    if (type === 'Bug') return 'bug_report';
    return 'check_box';
  };

  const getTaskIconColor = (type: TaskType) => {
    if (type === 'Story') return 'text-primary';
    if (type === 'Bug') return 'text-error';
    return 'text-primary';
  };

  const handleClose = () => setActiveTask(null);

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      estimatedTime: estimated === '' ? undefined : Number(estimated),
      loggedTime: logged === '' ? undefined : Number(logged)
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'user-1',
      userName: 'İlker',
      text: newComment,
      createdAt: Date.now()
    };
    updateTask(task.id, {
      comments: [...(task.comments || []), comment]
    });
    setNewComment('');
  };

  const estVal = estimated ? Number(estimated) : 0;
  const logVal = logged ? Number(logged) : 0;
  const progressPercent = estVal > 0 ? Math.min(100, Math.round((logVal / estVal) * 100)) : 0;
  const remaining = estVal - logVal > 0 ? estVal - logVal : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm">
      <div 
        className="bg-[#1C1D21] w-full max-w-[1024px] max-h-[90vh] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-lg py-md border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-md">
            <span className="flex items-center gap-xs text-on-surface-variant font-label-sm bg-surface-container-low px-sm py-xs rounded">
              <span className={`material-symbols-outlined text-[16px] ${getTaskIconColor(task.type)}`}>
                {getTaskIcon(task.type)}
              </span>
              PROJ-{task.id.split('-')[1]}
            </span>
            <div className="h-4 w-px bg-white/10"></div>
            <button className="text-on-surface-variant hover:text-on-surface font-label-sm flex items-center gap-xs transition-colors">
              <span className="material-symbols-outlined text-[16px]">visibility</span> Watch
            </button>
            <button className="text-on-surface-variant hover:text-on-surface font-label-sm flex items-center gap-xs transition-colors">
              <span className="material-symbols-outlined text-[16px]">share</span> Share
            </button>
            <button className="text-on-surface-variant hover:text-on-surface font-label-sm flex items-center gap-xs transition-colors">
              <span className="material-symbols-outlined text-[16px]">link</span> Link
            </button>
          </div>
          <button 
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row custom-scrollbar">
          
          <div className="flex-1 p-lg flex flex-col gap-xl border-r border-white/5 min-w-0">
            <div>
              <input 
                type="text" 
                className="w-full font-display text-display bg-transparent text-on-surface mb-xs focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 -ml-2"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleSave}
                placeholder="Task Summary"
              />
              <p className="font-body-md text-on-surface-variant flex items-center gap-sm mt-2">
                <span className={`w-2 h-2 rounded-full ${task.type === 'Bug' ? 'bg-error' : task.type === 'Story' ? 'bg-primary' : 'bg-secondary'}`}></span> 
                {task.type} Report
              </p>
            </div>

            <div className="flex flex-col gap-sm">
              <h3 className="font-h2 text-h2 text-on-surface">Description</h3>
              <div className="bg-surface-container-lowest border border-white/10 rounded-lg p-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <textarea 
                  className="w-full min-h-[120px] bg-transparent border-none text-on-surface font-body-md resize-y focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/50"
                  placeholder="Add detailed description..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
            </div>

            <div className="flex flex-col gap-md mt-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-sm">
                <h3 className="font-h2 text-h2 text-on-surface">Activity</h3>
                <div className="flex gap-sm">
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className={`font-label-sm pb-xs ${activeTab === 'comments' ? 'text-on-surface border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    Comments
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`font-label-sm pb-xs ${activeTab === 'history' ? 'text-on-surface border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    History
                  </button>
                </div>
              </div>

              {activeTab === 'comments' ? (
                <>
                  <div className="flex flex-col gap-md max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {task.comments?.map(comment => (
                      <div key={comment.id} className="flex gap-sm items-start">
                        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                          {comment.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-xs">
                          <div className="flex items-center gap-sm">
                            <span className="font-label-sm text-on-surface">{comment.userName}</span>
                            <span className="text-[10px] text-on-surface-variant">{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="font-body-md text-on-surface bg-surface-container-low p-sm rounded-lg border border-white/5">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-sm items-start mt-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                      <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                    </div>
                    <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg p-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                      <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-transparent border-none text-on-surface focus:ring-0 resize-none h-16 font-body-md placeholder:text-on-surface-variant/50 outline-none" 
                        placeholder="Add a comment..."
                      ></textarea>
                      <div className="flex justify-between items-center mt-xs">
                        <div className="flex gap-xs text-on-surface-variant">
                          <button className="hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                          <button className="hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                          <button className="hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">link</span></button>
                        </div>
                        <button 
                          onClick={handleAddComment}
                          className="bg-primary text-on-primary font-label-sm px-sm py-xs rounded hover:bg-primary-container transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-md py-md">
                  <div className="flex gap-sm items-center text-on-surface-variant font-body-md">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p><strong>{task.reporter.name}</strong> created the task - <span className="text-[10px]">{new Date(task.createdAt).toLocaleString()}</span></p>
                  </div>
                  <div className="flex gap-sm items-center text-on-surface-variant font-body-md">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <p><strong>{task.reporter.name}</strong> updated the status - <span className="text-[10px]">Just now</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[320px] bg-surface-container p-lg flex flex-col gap-lg shrink-0">
            
            <div className="flex flex-col gap-xs">
              <span className="font-label-sm text-on-surface-variant">STATUS</span>
              <button className="w-full flex items-center justify-between bg-surface-container-low border border-outline-variant rounded-lg p-sm hover:bg-surface-container-highest transition-colors">
                <span className="flex items-center gap-xs font-label-sm text-on-surface font-semibold uppercase">
                  <span className={`w-3 h-3 rounded-sm ${task.statusId === 'todo' ? 'bg-outline-variant' : task.statusId === 'in-progress' ? 'bg-primary' : 'bg-tertiary'}`}></span> 
                  {board.columns[task.statusId]?.title || 'Unknown'}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
              </button>
            </div>

            <div className="bg-surface-container-low border border-white/5 rounded-lg p-sm flex flex-col gap-md">
              
              <div className="flex flex-col gap-xs">
                <span className="font-label-sm text-on-surface-variant">Atanan Kişi</span>
                <div className="flex items-center gap-sm hover:bg-white/5 p-xs rounded cursor-pointer transition-colors -mx-xs">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-label-sm text-[10px]">UN</div>
                  <span className="font-body-md text-on-surface">Unassigned</span>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <span className="font-label-sm text-on-surface-variant">Oluşturan</span>
                <div className="flex items-center gap-sm hover:bg-white/5 p-xs rounded cursor-pointer transition-colors -mx-xs">
                  <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-[10px]">
                    {task.reporter.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-body-md text-on-surface">{task.reporter.name}</span>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <span className="font-label-sm text-on-surface-variant">Priority</span>
                <div className="flex items-center gap-sm">
                  {task.priority === 'Highest' || task.priority === 'High' ? (
                    <span className="material-symbols-outlined text-error text-[18px]">keyboard_double_arrow_up</span>
                  ) : task.priority === 'Medium' ? (
                    <span className="material-symbols-outlined text-secondary text-[18px]">menu</span>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[18px]">keyboard_double_arrow_down</span>
                  )}
                  <span className="font-body-md text-on-surface">{task.priority}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-on-surface-variant">Zaman Takibi</span>
                <button className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">more_horiz</span></button>
              </div>
              <div className="bg-surface-container-low border border-white/5 rounded-lg p-md flex flex-col gap-md">
                
                <div className="flex flex-col gap-xs">
                  <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden flex">
                    <div className="bg-primary h-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <div className="flex justify-between font-label-sm text-on-surface-variant text-[10px]">
                    <span>{logVal}h logged</span>
                    <span>{remaining}h remaining</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-label-sm text-on-surface-variant text-xs flex-1">Original Estimate</span>
                    <input 
                      type="number" 
                      className="w-20 bg-surface-container border border-white/10 rounded px-2 py-1 font-label-sm text-on-surface text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      value={estimated}
                      onChange={e => setEstimated(e.target.value ? Number(e.target.value) : '')}
                      onBlur={handleSave}
                      placeholder="0h"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-label-sm text-on-surface-variant text-xs flex-1">Time Logged</span>
                    <input 
                      type="number" 
                      className="w-20 bg-surface-container border border-white/10 rounded px-2 py-1 font-label-sm text-on-surface text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      value={logged}
                      onChange={e => setLogged(e.target.value ? Number(e.target.value) : '')}
                      onBlur={handleSave}
                      placeholder="0h"
                    />
                  </div>
                </div>

              </div>
              <div className="flex gap-sm">
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      useBoardStore.getState().deleteTask(task.id);
                    }
                  }}
                  className="flex-1 border border-error/50 text-error font-label-sm py-sm rounded-lg hover:bg-error/10 transition-colors flex justify-center items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] border border-outline-variant text-on-surface font-label-sm py-sm rounded-lg hover:bg-surface-container-highest transition-colors flex justify-center items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span> Save
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
