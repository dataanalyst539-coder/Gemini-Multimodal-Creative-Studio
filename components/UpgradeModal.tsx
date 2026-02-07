
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface UpgradeModalProps {
  userProfile: UserProfile;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ userProfile, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tier: 'pro' })
        .eq('id', userProfile.id);
      
      if (error) throw error;
      window.location.reload(); // Hard refresh to update everything
    } catch (err: any) {
      alert('Upgrade failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { title: 'Image Vision', desc: 'Generate high-fidelity 2K images with Gemini 2.5 Flash.', icon: '🎨' },
    { title: 'Voice Lab', desc: 'Experience real-time, low-latency multimodal voice chat.', icon: '🎙️' },
    { title: 'Video Studio', desc: 'Create 1080p cinematic video clips with Veo 3.1 Fast.', icon: '🎬' },
    { title: 'Pro Assets', desc: 'No watermarks and higher generation limits.', icon: '⚡' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg glass-card rounded-3xl shadow-2xl border-slate-800 bg-slate-900 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              Premium Upgrade
            </span>
            <h2 className="text-3xl font-bold mb-2">Unlock Pro Tools</h2>
            <p className="text-slate-400 text-sm">Elevate your creativity with our most powerful Gemini models.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-2xl">{benefit.icon}</div>
                <div>
                  <h4 className="font-bold text-sm">{benefit.title}</h4>
                  <p className="text-xs text-slate-400">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02] transition-transform text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Upgrade Now — $20/mo</>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500">
              Mock payment. Upgrading will immediately grant access to all Pro features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
