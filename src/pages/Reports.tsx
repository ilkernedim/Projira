import { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function Reports() {
  const { pastSprints, board } = useBoardStore();
  const [timeFilter, setTimeFilter] = useState<'30days' | 'quarter'>('30days');

  const getFilteredSprints = () => {
    const now = Date.now();
    const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;
    
    return pastSprints.filter(sprint => {
      if (!sprint.endDate) return true;
      const diff = now - sprint.endDate;
      if (timeFilter === '30days') return diff <= daysToMs(30);
      if (timeFilter === 'quarter') return diff <= daysToMs(90);
      return true;
    });
  };

  const filteredSprints = getFilteredSprints();
  const hasData = filteredSprints.length > 0;

  const todoCount = board.columns['todo'].taskIds.length;
  const inProgressCount = board.columns['in-progress'].taskIds.length;
  const doneCount = board.columns['done'].taskIds.length;
  const totalCurrentTasks = todoCount + inProgressCount + doneCount;
  const sprintProgressPercent = totalCurrentTasks > 0 ? Math.round((doneCount / totalCurrentTasks) * 100) : 0;

  const totalCompleted = filteredSprints.reduce((acc, s) => acc + s.completedTasks, 0);
  const avgDeviation = hasData ? Math.round(filteredSprints.reduce((acc, s) => acc + s.deviationPercent, 0) / filteredSprints.length) : 0;
  
  const timeData = filteredSprints.map(s => ({
    name: s.name,
    'Tahmini (h)': s.totalEstimated,
    'Gerçekleşen (h)': s.totalLogged,
  }));

  const deviationData = filteredSprints.map(s => ({
    name: s.name,
    'Sapma (%)': s.deviationPercent
  }));

  return (
    <div className="flex-1 p-margin-page overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h1 className="font-display text-display text-on-surface mb-1">Visual Analytics</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time reporting and performance metrics.</p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="bg-surface-container-low border border-white/10 rounded-lg p-1 flex">
            <button 
              onClick={() => setTimeFilter('30days')}
              className={`px-3 py-1 rounded font-label-sm transition-colors ${timeFilter === '30days' ? 'bg-surface-container-high text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setTimeFilter('quarter')}
              className={`px-3 py-1 rounded font-label-sm transition-colors ${timeFilter === 'quarter' ? 'bg-surface-container-high text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              This Quarter
            </button>
          </div>
          <button className="p-2 rounded-lg border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div className="glass-panel rounded-xl p-md relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex justify-between items-start mb-sm">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Issues Resolved</h3>
              <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            </div>
            <div className="flex items-end gap-sm">
              <span className="font-display text-display text-on-surface">{totalCompleted}</span>
              <span className="font-label-sm text-label-sm text-primary flex items-center pb-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> {hasData ? filteredSprints[filteredSprints.length-1].completedTasks : 0} latest
              </span>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-md relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex justify-between items-start mb-sm">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg Time Deviation</h3>
              <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
            </div>
            <div className="flex items-end gap-sm">
              <span className={`font-display text-display ${avgDeviation > 15 ? 'text-error' : 'text-on-surface'}`}>{avgDeviation}%</span>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-md relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex justify-between items-start mb-sm">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Current Sprint Progress</h3>
              <span className="material-symbols-outlined text-tertiary-container text-[20px]">flag</span>
            </div>
            <div className="flex items-end gap-sm mb-2">
              <span className="font-display text-display text-on-surface">{sprintProgressPercent}%</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${sprintProgressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-8 glass-panel rounded-xl p-lg flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h2 className="font-h2 text-h2 text-on-surface">Time Estimation vs Actual</h2>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
          <div className="flex-1 relative rounded-lg overflow-hidden">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c333a" vertical={false} />
                  <XAxis dataKey="name" stroke="#8b90a0" tick={{fill: '#8b90a0', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8b90a0" tick={{fill: '#8b90a0', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181c23', borderColor: '#31353d', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#e0e2ed' }}
                    cursor={{ fill: '#1c2028' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Tahmini (h)" fill="#adc6ff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Gerçekleşen (h)" fill="#d0bcff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-on-surface-variant">No sprint data available for this period.</div>
            )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 flex flex-col gap-lg">
          <div className="glass-panel rounded-xl p-md flex-1 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-h2 text-h2 text-on-surface text-base">Deviation Trend</h2>
            </div>
            <div className="flex-1 h-[200px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deviationData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2c333a" vertical={false} />
                    <XAxis dataKey="name" stroke="#8b90a0" tick={{fill: '#8b90a0', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8b90a0" tick={{fill: '#8b90a0', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#181c23', borderColor: '#31353d', color: '#fff', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="Sapma (%)" stroke="#ef6719" strokeWidth={3} dot={{ r: 4, fill: '#181c23', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-on-surface-variant text-sm">No data</div>
              )}
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-md bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex justify-between items-center mb-sm">
              <h2 className="font-h2 text-h2 text-on-surface text-base">Team Velocity</h2>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">speed</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="font-display text-display text-on-surface leading-none">
                {hasData ? Math.round(filteredSprints.reduce((acc, s) => acc + s.completedTasks, 0) / filteredSprints.length) : 0}
              </span>
              <span className="text-on-surface-variant font-label-sm pb-1">tasks / avg</span>
            </div>
            <div className="flex items-end h-12 gap-1 mt-2">
              <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[60%] hover:bg-outline-variant transition-colors"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[75%] hover:bg-outline-variant transition-colors"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[50%] hover:bg-outline-variant transition-colors"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t-sm h-[85%] hover:bg-outline-variant transition-colors"></div>
              <div className="flex-1 bg-primary/80 rounded-t-sm h-[100%] shadow-[0_0_10px_rgba(173,198,255,0.2)]"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
