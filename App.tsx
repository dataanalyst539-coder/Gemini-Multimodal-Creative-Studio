
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SearchChat from './components/SearchChat';
import ImageGen from './components/ImageGen';
import VoiceInteraction from './components/VoiceInteraction';
import VideoGen from './components/VideoGen';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'search': return <SearchChat />;
      case 'image': return <ImageGen />;
      case 'voice': return <VoiceInteraction />;
      case 'video': return <VideoGen />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
