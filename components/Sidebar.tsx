
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems: { id: AppView; label: string; icon: string; description: string }[] = [
    { id: 'dashboard', label: 'Home', icon: '🏠', description: 'Overview' },
    { id: 'search', label: 'Smart Search', icon: '🔍', description: 'Real-time Grounded Search' },
    { id: 'image', label: 'Image Vision', icon: '🎨', description: 'Generative Arts' },
    { id: 'voice', label: 'Voice Lab', icon: '🎙️', description: 'Real-time Conversation' },
    { id: 'video', label: 'Video Studio', icon: '🎬', description: 'Cinematic Generations' },
  ];

  return (
    <aside className="w-20 md:w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur-md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div 
            className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 cursor-pointer" 
            onClick={() => onNavigate('dashboard')}
          >
            G
          </div>
          <span className="font-bold text-xl hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Studio
          </span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                currentView === item.id
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="hidden md:block text-left">
                <div className="font-medium text-sm">
                  {item.label}
                </div>
                <div className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 border border-slate-700"></div>
          <div className="hidden md:block overflow-hidden">
            <div className="text-xs font-semibold text-slate-300 truncate">Creator Mode</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-tighter">Full Access Enabled</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
