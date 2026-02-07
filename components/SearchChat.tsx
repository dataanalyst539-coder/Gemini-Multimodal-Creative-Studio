
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

const SearchChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('studio_search_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    } else {
      setMessages([
        { role: 'model', text: 'Hello! I can search the web for up-to-date information. What would you like to know about current events, news, or trends?' }
      ]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('studio_search_history', JSON.stringify(messages));
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const clearHistory = () => {
    if (confirm("Clear all search history?")) {
      const initial = [{ role: 'model', text: 'Hello! I can search the web for up-to-date information. What would you like to know about current events, news, or trends?' }];
      setMessages(initial as Message[]);
      localStorage.removeItem('studio_search_history');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.filter(chunk => chunk.web).map(chunk => ({
        uri: chunk.web!.uri,
        title: chunk.web!.title || chunk.web!.uri
      }));

      const aiMsg: Message = {
        role: 'model',
        text: response.text || 'I couldn\'t find a specific answer for that.',
        sources: sources as any
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Sorry, I encountered an error searching for that.';
      
      if (err.message?.includes('PERMISSION_DENIED') || err.status === 403) {
        errorMessage = 'Access Denied (403): Your API key does not have permission for this model or search tool.';
      }

      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Smart Search</h2>
          <p className="text-xs text-slate-400">Powered by Gemini 3 Flash & Google Search</p>
        </div>
        <button 
          onClick={clearHistory}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                : 'bg-slate-800 border border-slate-700 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, si) => (
                      <a 
                        key={si} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-48 bg-slate-700 rounded"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button
            disabled={loading}
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchChat;
