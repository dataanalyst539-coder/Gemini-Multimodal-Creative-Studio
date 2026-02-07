
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Load last session
  useEffect(() => {
    const savedImg = localStorage.getItem('studio_last_image');
    const savedPrompt = localStorage.getItem('studio_last_image_prompt');
    if (savedImg) setResultImage(savedImg);
    if (savedPrompt) setPrompt(savedPrompt);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setResultImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64 = `data:image/png;base64,${part.inlineData.data}`;
          setResultImage(base64);
          localStorage.setItem('studio_last_image', base64);
          localStorage.setItem('studio_last_image_prompt', prompt);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate image. Please try a different prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-950">
      <div className="w-80 border-r border-slate-800 p-6 flex flex-col gap-8 bg-slate-900/30 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold mb-1">Image Canvas</h2>
          <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash Image</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">Prompt</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision..."
              className="mt-2 w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Aspect Ratio</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['1:1', '16:9', '9:16', '3:4', '4:3'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    aspectRatio === ratio
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={isGenerating || !prompt}
            onClick={handleGenerate}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-12 flex items-center justify-center relative overflow-hidden">
        {resultImage ? (
          <div className="relative group max-w-full max-h-full">
            <img 
              src={resultImage} 
              alt="Generated" 
              className="rounded-2xl shadow-2xl max-w-full max-h-[80vh] border border-slate-800 object-contain"
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                onClick={() => {
                  setResultImage(null);
                  localStorage.removeItem('studio_last_image');
                }}
                className="bg-red-500/60 backdrop-blur px-4 py-2 rounded-full text-xs font-bold hover:bg-red-500/80 transition-all"
              >
                Delete
              </button>
              <a 
                href={resultImage} 
                download="generated-image.png"
                className="bg-black/60 backdrop-blur px-4 py-2 rounded-full text-xs font-bold hover:bg-black/80 transition-all"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-md">
            {isGenerating ? (
              <div className="space-y-6">
                <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 font-medium">Gemini is dreaming up your image...</p>
              </div>
            ) : (
              <div className="space-y-4 opacity-30">
                <div className="text-8xl mb-4">🖼️</div>
                <h3 className="text-xl font-bold">Your Canvas Awaits</h3>
                <p className="text-sm">Describe what you want to see and click generate.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGen;
