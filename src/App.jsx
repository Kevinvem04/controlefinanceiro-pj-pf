import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { useFinanceStore } from './hooks/useFinanceStore';
import Sidebar from './components/Sidebar';
import FAB from './components/FAB';
import Filters from './components/Filters';
import DashboardUnificado from './views/DashboardUnificado';
import Settings from './views/Settings';
import Login from './views/Login';
import TutorialModal from './components/TutorialModal';
import { startOfMonth, endOfMonth, format } from 'date-fns';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const store = useFinanceStore(session?.user);

  const [currentView, setCurrentView] = useState('dashboard_general');
  const [globalEntity, setGlobalEntity] = useState('ALL'); 
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-dark-bg text-active-blue text-xl font-bold animate-pulse">Iniciando Motor de Autenticação...</div>;
  if (!session) return <Login />;

  if (!store.isLoaded) return <div className="flex h-screen items-center justify-center bg-dark-bg text-active-blue text-xl font-bold animate-pulse">Carregando Nuvem Financeira...</div>;

  return (
    <div className="flex h-screen bg-dark-bg text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header with Filters */}
        <header className="min-h-[80px] h-auto border-b border-dark-border px-4 py-4 md:px-8 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between bg-dark-surface md:bg-dark-surface/50 md:backdrop-blur-md z-10 w-full gap-4 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 hidden md:block">
              {currentView === 'dashboard_general' && 'Centro de Atividades (Dashboards Unificados)'}
              {currentView === 'settings' && 'Mesa de Operações (Categorias)'}
            </h1>
            
            {/* Unified Entity Toggle - Segmented Control no Mobile */}
            {currentView === 'dashboard_general' && (
              <div className="flex bg-dark-bg rounded-lg border border-dark-border p-1 w-full md:w-auto">
                {['ALL', 'PJ', 'PF'].map(ent => (
                  <button 
                    key={ent}
                    onClick={() => setGlobalEntity(ent)}
                    className={`flex-1 md:flex-none px-3 py-2 md:py-1 text-sm font-semibold rounded-md transition-all min-h-[44px] md:min-h-0 ${
                      globalEntity === ent 
                      ? 'bg-active-blue/20 text-active-blue shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ent === 'ALL' ? 'Unificado' : ent}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-auto">
             <Filters dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </header>

        {/* Scrollable View Area - padding extra no mobile (pb-24) para fugir da tab bar */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto w-full">
             {currentView === 'dashboard_general' && <DashboardUnificado entity={globalEntity} store={store} dateRange={dateRange} />}
             {currentView === 'settings' && <Settings store={store} />}
          </div>
        </div>

        {/* Floating Action Button */}
        <FAB store={store} />
      </main>
      
      {/* Primeiro Acesso Tutorial */}
      <TutorialModal />
    </div>
  );
}

export default App;
