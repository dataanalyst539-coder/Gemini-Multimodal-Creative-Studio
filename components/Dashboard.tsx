
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const cards = [
    { id: 'search', title: 'Smart Search', desc: 'Ask complex questions with web-grounded results.', icon: '🔍' },
    { id: 'image', title: 'Image Canvas', desc: 'Transform text into stunning visual artwork.', icon: '🎨' },
    { id: 'voice', title: 'Voice Lab', icon: '🎙️', desc: 'Instant real-time voice conversation.' },
    { id: 'video', title: 'Video Studio', icon: '🎬', desc: 'Generate cinematic video clips.' },
  ];

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Multimodal <span className="text-blue-500">Creative Studio</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Welcome to your high-performance creative hub. All advanced multimodal tools are now active and ready for exploration.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id as AppView)}
            className="group relative p-6 rounded-2xl border border-slate-800 bg-slate-900/50 transition-all text-left flex flex-col gap-4 overflow-hidden hover:bg-slate-800/80"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all rounded-full -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start">
              <div className="text-4xl">{card.icon}</div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-widest">
                Active
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">{card.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{card.desc}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 group-hover:translate-x-2 transition-transform">
              Launch <span>→</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-2xl p-8 relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-6">Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">🌐</div>
                <div>
                  <h4 className="font-bold text-sm">Grounded Intelligence</h4>
                  <p className="text-xs text-slate-500">Real-time search with source attribution.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">✨</div>
                <div>
                  <h4 className="font-bold text-sm">Visual Synthesis</h4>
                  <p className="text-xs text-slate-500">High-fidelity text-to-image generation.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl">👂</div>
                <div>
                  <h4 className="font-bold text-sm">Native Voice</h4>
                  <p className="text-xs text-slate-500">Low-latency audio interactions.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl">📽️</div>
                <div>
                  <h4 className="font-bold text-sm">Cinematic Veo</h4>
                  <p className="text-xs text-slate-500">Next-gen video generation preview.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 border-green-500/20 bg-green-500/5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full border-2 border-green-500/30 flex items-center justify-center text-3xl mb-4">✅</div>
          <h3 className="font-bold mb-2">System Status</h3>
          <p className="text-xs text-slate-400">
            All models are operational and authenticated. Start creating without limits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
