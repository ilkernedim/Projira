import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Board from './pages/Board';
import Reports from './pages/Reports';
import CreateTaskModal from './components/CreateTaskModal';
import Settings from './pages/Settings';
import { useBoardStore } from './store/useBoardStore';

export default function App() {
  const currentView = useBoardStore(state => state.currentView);

  return (
    <div className="text-on-surface font-body-md min-h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col md:ml-[260px] h-screen overflow-hidden">
        <Topbar />
        {currentView === 'board' && <Board />}
        {currentView === 'reports' && <Reports />}
        {currentView === 'settings' && <Settings />}
      </main>
      <CreateTaskModal />
    </div>
  );
}
