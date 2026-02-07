
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const VideoGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      // Use the pre-configured window.aistudio helper to check API key status
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback for dev environment where global key is used
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      // Trigger the selection dialog as required for Veo models
      await (window as any).aistudio.openSelectKey();
      // Assume success to avoid race conditions as per guidelines
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    // Fix: Removed call to undefined setResultImage(null) on line 39
    setVideoUrl(null);
    setStatus('Initializing generation...');

    try {
      // Create a fresh instance of GoogleGenAI right before the call to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      // Poll the operation status until completion
      while (!operation.done) {
        setStatus('Processing video (this may take a few minutes)...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        // Use the correct operations.getVideosOperation method from the ai instance
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      // Extract the video URI from the completed operation response
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        // Append the API key to the download URL as required by Veo
        const fetchRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await fetchRes.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error('Video Generation Error:', err);
      const isNotFound = err?.message?.includes('Requested entity was not found');
      const isPermissionDenied = err?.message?.includes('PERMISSION_DENIED') || err?.status === 403;

      if (isNotFound || isPermissionDenied) {
        // Reset key state and prompt re-selection if authentication fails
        setHasApiKey(false);
        alert(isPermissionDenied 
          ? 'API Key Permission Denied (403). You must select a key from a paid GCP project with Veo access.' 
          : 'Requested entity was not found. Please re-select your API key.'
        );
        handleSelectKey();
      } else {
        alert('Video generation failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="text-6xl mb-6">🔑</div>
        <h2 className="text-2xl font-bold mb-4">API Key Required for Veo</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Generating video requires a paid Google Cloud project API key. 
          Please select your key to access the Cinematic Studio.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/30"
        >
          Select API Key
        </button>
        <div className="mt-8">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            Learn more about Gemini API Billing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-6 border-b border-slate-800 bg-slate-900/30">
        <h2 className="text-xl font-bold">Cinematic Studio</h2>
        <p className="text-xs text-slate-400">Powered by Veo 3.1 Fast</p>
      </div>

      <div className="flex-1 p-12 flex flex-col lg:flex-row gap-12 overflow-y-auto">
        <div className="lg:w-1/3 flex flex-col gap-8">
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visual Concept</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A breathtaking sunset over a cyberpunk Tokyo, neon lights reflecting on wet streets, slow motion, cinematic 4k..."
                className="mt-2 w-full h-48 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Resolution</div>
                <div className="text-sm font-semibold">1080p Full HD</div>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Aspect Ratio</div>
                <div className="text-sm font-semibold">16:9 Landscape</div>
              </div>
            </div>

            <button
              disabled={isGenerating || !prompt}
              onClick={handleGenerate}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                isGenerating 
                  ? 'bg-slate-800 text-slate-500' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20'
              }`}
            >
              {isGenerating ? 'Rendering Clip...' : 'Generate Cinematic Video'}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <h4 className="text-sm font-bold mb-2">💡 Creative Tip</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For best results with Veo, specify camera movements (e.g., "panning shot"), 
              lighting styles (e.g., "golden hour"), and high-fidelity details.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed relative min-h-[400px]">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full h-full rounded-3xl object-contain shadow-2xl"
            />
          ) : (
            <div className="text-center px-8">
              {isGenerating ? (
                <div className="space-y-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🎬</div>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-2">{status}</p>
                    <p className="text-slate-500 text-sm">Please keep this window open while the model renders the scene.</p>
                  </div>
                </div>
              ) : (
                <div className="opacity-20 flex flex-col items-center">
                  <div className="text-9xl mb-4">🎥</div>
                  <h3 className="text-2xl font-bold">Director's View</h3>
                  <p className="text-sm mt-2">Ready to render your cinematic vision.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGen;
