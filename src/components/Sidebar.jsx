import { LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ currentView, setCurrentView }) {
  const cn = (...inputs) => twMerge(clsx(inputs));

  const navItems = [
    { id: 'dashboard_general', label: 'Resumo Geral', icon: LayoutDashboard },
    { id: 'settings', label: 'Configurações / Categorias', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark-surface border-r border-dark-border flex-col">
        <div className="h-20 flex items-center px-6 border-b border-dark-border">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
            Finkev
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => {
            const active = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg font-medium transition-all duration-200",
                  active 
                    ? "bg-active-blue/10 text-active-blue border border-active-blue/20" 
                    : "text-slate-400 hover:bg-dark-border/50 hover:text-slate-200"
                )}
              >
                <Icon size={20} className={active ? "text-active-blue" : ""} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-dark-border">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full py-2 bg-expense-crimson/10 text-expense-crimson hover:bg-expense-crimson hover:text-white rounded transition-colors text-sm font-semibold"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-dark-surface border-t border-dark-border z-40 flex justify-around items-start pt-2 pb-6 px-2">
        {navItems.map(item => {
          const active = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={`mob-${item.id}`}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[44px]",
                active ? "text-active-blue" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon size={20} className={active ? "text-active-blue mb-1" : "mb-1"} />
              <span className="text-[10px] font-medium leading-none">{item.label.split('/')[0].trim()}</span>
            </button>
          );
        })}
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex flex-col items-center justify-center w-full h-full min-h-[44px] text-expense-crimson hover:text-red-400"
        >
          <LogOut size={20} className="mb-1" />
          <span className="text-[10px] font-medium leading-none">Sair</span>
        </button>
      </nav>
    </>
  );
}
