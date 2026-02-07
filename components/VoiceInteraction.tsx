
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audio';

const VoiceInteraction: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const resample = (data: Float32Array, inputRate: number, outputRate: number) => {
    if (inputRate === outputRate) return data;
    const ratio = inputRate / outputRate;
    const newLength = Math.round(data.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = data[Math.round(i * ratio)];
    }
    return result;
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close?.(); } catch (e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Fix: Don't force 16k here because some browsers (Firefox) throw if it doesn't match hardware.
      // We will resample manually in onaudioprocess.
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      inputAudioContextRef.current = inputAudioContext;
      const inputSampleRate = inputAudioContext.sampleRate;
      
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputAudioContext;

      if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
      if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              // Manually resample to 16000 for Gemini
              const downsampled = resample(inputData, inputSampleRate, 16000);
              const pcmBlob = createBlob(downsampled);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
            
            setIsActive(true);
            setIsConnecting(false);
            setTranscript(prev => [...prev, 'System: Connection established. Start speaking!']);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const audioCtx = outputAudioContextRef.current!;
              if (audioCtx.state === 'suspended') await audioCtx.resume();
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), audioCtx, 24000, 1);
              const source = audioCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, `Gemini: ${text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev, `You: ${text}`]);
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setErrorMessage(e.message || 'Connection error. Please check your API key.');
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: 'You are a helpful AI assistant. Keep responses short and conversational.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setIsConnecting(false);
      setErrorMessage(err.message || 'Failed to start voice session.');
      stopSession();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Voice Lab</h2>
          <p className="text-xs text-slate-400">Gemini 2.5 Flash Native Audio</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isActive ? 'Live' : 'Standby'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center gap-8">
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-3 rounded-xl text-sm max-w-md text-center">
            {errorMessage}
          </div>
        )}

        <div className="relative">
          {isActive && (
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full"></div>
          )}
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl ${
              isActive 
                ? 'bg-red-500/20 border-2 border-red-500 text-red-500 shadow-red-500/10' 
                : 'bg-blue-600 border-2 border-blue-400 text-white shadow-blue-600/20 hover:bg-blue-500'
            } ${isConnecting ? 'opacity-50 cursor-wait' : ''}`}
          >
            <span className="text-6xl mb-2">{isActive ? '⏹️' : '🎙️'}</span>
            <span className="font-bold text-sm tracking-widest uppercase">
              {isConnecting ? 'Connecting...' : isActive ? 'End Call' : 'Start Call'}
            </span>
          </button>
        </div>

        <div className="max-w-xl w-full text-center">
          <h3 className="text-2xl font-bold mb-4">
            {isActive ? 'Gemini is listening...' : 'Ready for conversation?'}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Interact with the model in real-time. This mode uses a manual resampler to ensure compatibility across all browsers.
          </p>
        </div>

        {transcript.length > 0 && (
          <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-64 overflow-y-auto mt-4">
             <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-wider">Live Transcription</div>
             <div className="space-y-3">
               {transcript.map((line, idx) => (
                 <div key={idx} className="text-sm border-l-2 border-slate-800 pl-4 py-1">
                   {line}
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInteraction;
