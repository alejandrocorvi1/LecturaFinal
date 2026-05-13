/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Settings2, Info, Activity, Mic, MicOff } from 'lucide-react';
import { WORDS, WordEntry } from './constants';

// --- Auto-scaling Component ---
function ResponsiveWord({ word }: { word: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(10);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width === 0 || height === 0) return;

      // Adjusted scaling factors for wider and taller text area
      const targetWidth = width * 0.90; 
      const targetHeight = height * 0.80;

      // Aggressive scaling logic but with safety margin
      const charFactor = 0.65; 
      const sizeW = targetWidth / (word.length * charFactor);
      const sizeH = targetHeight;

      setFontSize(Math.min(sizeW, sizeH));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure(); // Initial

    return () => observer.disconnect();
  }, [word]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={word}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: "linear" }}
          className="w-full h-full flex flex-col items-center justify-center text-center"
        >
          <div className="flex flex-col items-center justify-center w-full select-none px-4">
            <span className="block font-mono text-[10px] uppercase opacity-40 mb-4 tracking-[0.4em] leading-none">
              Palabra Actual
            </span>
            <h1
              style={{ fontSize: `${fontSize}px` }}
              className="font-black uppercase tracking-tighter text-center leading-[0.8] whitespace-nowrap"
            >
              {word}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [currentWord, setCurrentWord] = useState<WordEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(4.5); // matching design html default
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [pps, setPps] = useState(0);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isActualListening, setIsActualListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const lastWordRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentWordRef = useRef<string | null>(null);

  // Sync ref for speech recognition access without re-starting service
  useEffect(() => {
    currentWordRef.current = currentWord?.word || null;
  }, [currentWord]);

  const getNextWord = useCallback(() => {
    const availableWords = WORDS.filter(w => w.word !== lastWordRef.current);
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selected = availableWords[randomIndex];
    lastWordRef.current = selected.word;
    return selected;
  }, []);

  const handleNext = useCallback(() => {
    setCurrentWord(getNextWord());
    startTimeRef.current = performance.now();
    setProgress(0);
  }, [getNextWord]);

  // Speech Recognition Logic
  useEffect(() => {
    let recognition: any = null;

    if (isMicEnabled && isPlaying) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicError("Navegador no compatible");
        setIsMicEnabled(false);
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsActualListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        const cleanTranscript = transcript.toLowerCase().trim();
        setLastTranscript(cleanTranscript);
        
        const targetWord = currentWordRef.current?.toLowerCase().trim();
        
        if (targetWord && cleanTranscript.includes(targetWord)) {
          setScore(s => {
            const nextScore = s + 1;
            // Update PPS
            if (sessionStartTimeRef.current) {
              const elapsedSeconds = (performance.now() - sessionStartTimeRef.current) / 1000;
              if (elapsedSeconds > 0) {
                setPps(nextScore / elapsedSeconds);
              }
            }
            return nextScore;
          });
          setLastTranscript(""); // Limpiar para la siguiente palabra
          handleNext();
        }
      };

      recognition.onerror = (event: any) => {
        setIsActualListening(false);
        
        if (event.error === 'not-allowed') {
          console.error("Speech Recognition Error:", event.error);
          setMicError("Acceso denegado");
          setIsMicEnabled(false);
        } else if (event.error === 'no-speech') {
          // El error 'no-speech' es normal cuando hay silencio prolongado.
          // Lo manejamos silenciosamente para que el evento 'onend' reinicie la escucha.
        } else if (event.error === 'aborted') {
          // El reconocimiento fue detenido intencionalmente o por el sistema.
        } else {
          console.error("Speech Recognition Error:", event.error);
          setMicError(event.error);
        }
      };

      recognition.onend = () => {
        setIsActualListening(false);
        if (isMicEnabled && isPlaying) {
          try {
            recognition.start();
          } catch(e) {
            console.error(e);
          }
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }

    return () => {
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
      }
      setIsActualListening(false);
    };
  }, [isMicEnabled, isPlaying, handleNext]);

  const animate = useCallback((time: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }

    const elapsed = (time - startTimeRef.current) / 1000;
    const currentProgress = Math.min(elapsed / duration, 1);
    setProgress(currentProgress);

    if (currentProgress >= 1) {
      handleNext();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [duration, handleNext]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = null;
      setProgress(0);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  const handleToggle = () => {
    const nextPlaying = !isPlaying;
    if (!isPlaying) {
      setCurrentWord(getNextWord());
      setScore(0);
      setPps(0);
      sessionStartTimeRef.current = performance.now();
    } else {
      sessionStartTimeRef.current = null;
    }
    setIsPlaying(nextPlaying);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen relative bg-bg selection:bg-text selection:text-bg border-2 border-green-200 overflow-hidden box-border">
      {/* Absolute center marks (Architectural Accent) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-24 bg-text z-50 pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-24 bg-text z-50 pointer-events-none" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-px bg-text z-50 pointer-events-none" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-px bg-text z-50 pointer-events-none" />

      {/* Header */}
      <header className="px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-8 grid grid-cols-2 md:flex md:flex-row items-center justify-between border-b border-text/10 relative z-10 gap-4">
        {/* Left: Correctas */}
        <div className="order-1 md:order-none flex-1 flex justify-start w-full md:w-auto h-10 md:h-16 lg:h-20">
          <AnimatePresence>
            {score > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex items-center gap-2 md:gap-3 lg:gap-4 px-3 md:px-6 lg:px-8 py-2 bg-text text-bg rounded-lg md:rounded-xl shadow-2xl border-2 border-white/20 whitespace-nowrap"
              >
                <span className="font-mono text-lg font-black leading-none tracking-tighter uppercase">CORRECTAS: {score}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Center: Info/Mic */}
        <div className="order-3 md:order-none col-span-2 md:col-span-1 flex-shrink-0 flex items-center justify-between w-full md:w-auto gap-3 md:gap-6">
          {isMicEnabled && isActualListening && (
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-1.5 md:gap-2 px-2 py-1 border border-green-500/20 rounded-full"
            >
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full" />
              <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-green-600">Escuchando...</span>
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isMicEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 animate-pulse'} transition-colors duration-500`} />
            <span className="font-mono text-[9px] md:text-[11px] uppercase tracking-widest opacity-80 whitespace-nowrap">
              {isMicEnabled ? "MICRÓFONO ACTIVO" : "MICRÓFONO INACTIVO"}
            </span>
          </div>
          <div className="w-px h-3 md:h-4 bg-text opacity-20" />
          <span className="font-mono text-[9px] md:text-[11px] uppercase opacity-50 tracking-widest whitespace-nowrap">
            {currentWord?.category || "---"}
          </span>
        </div>

        {/* Right: PPS */}
        <div className="order-2 md:order-none flex-1 flex justify-end w-full md:w-auto h-10 md:h-16 lg:h-20">
          <AnimatePresence>
            {score > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex items-center gap-2 md:gap-3 lg:gap-4 px-3 md:px-6 lg:px-8 py-2 bg-text text-bg rounded-lg md:rounded-xl shadow-2xl border-2 border-white/20 whitespace-nowrap"
              >
                <span className="font-mono text-lg font-black leading-none tracking-tighter uppercase">PPS: {pps.toFixed(2)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 md:px-8 lg:px-0 relative overflow-hidden">
        {currentWord ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
            <ResponsiveWord word={currentWord.word} />
            <AnimatePresence>
              {isMicEnabled && isActualListening && lastTranscript && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.3, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 md:bottom-10 lg:bottom-12 font-mono text-[10px] md:text-sm uppercase tracking-widest italic z-20"
                >
                  "{lastTranscript}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.p
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="font-display text-2xl md:text-3xl lg:text-4xl font-black opacity-30 text-center uppercase tracking-tighter px-6"
            >
              Presiona comenzar para iniciar
            </motion.p>
          </div>
        )}

        {/* Progress Bar Container */}
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto pb-[24px] md:pb-[42px] lg:pb-[50px] px-4 md:px-0">
          <div className="h-4 md:h-6 lg:h-8 w-full bg-black/5 border border-text md:border-2 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] rounded-sm">
            <div
              className="h-full absolute left-0 top-0 transition-[width] duration-75 linear"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(to right, #4ade80, #facc15, #f87171)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 md:mt-3 font-mono text-[8px] md:text-[10px] uppercase tracking-widest opacity-60">
            <span>0.0s</span>
            {isPlaying && (
              <span className="animate-pulse">{(duration * progress).toFixed(1)}s</span>
            )}
            <span>{duration.toFixed(1)}s</span>
          </div>
        </div>
      </main>

      {/* Footer / Controls */}
      <footer className="pt-1 pb-[28px] md:pb-[34px] lg:pb-[50px] px-4 md:px-6 lg:px-10 border-t border-text/10 bg-bg relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-12 gap-4 md:gap-8 lg:gap-12 items-end">
          
          {/* Slider Control */}
          <div className="col-span-12 sm:col-span-7 lg:col-span-8 flex flex-col order-2 sm:order-1">
            <div className="flex justify-between items-end mb-1 md:mb-3">
              <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-90">Intervalo</label>
              <span className="font-mono text-sm md:text-lg lg:text-xl font-bold">{duration.toFixed(1)}s</span>
            </div>
            
            <div className="relative pt-1 md:pt-2 pb-4 md:pb-6 lg:pb-8">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={duration}
                onChange={(e) => {
                  setDuration(parseFloat(e.target.value));
                  if (isPlaying) {
                    startTimeRef.current = performance.now();
                    setProgress(0);
                  }
                }}
                className="w-full"
                aria-label="Ajustar intervalo de tiempo"
              />
            </div>
            
            <div className="flex justify-between font-mono text-[8px] md:text-[9px] opacity-40 uppercase tracking-widest">
              <span>1.0S</span>
              <span className="hidden xs:inline">2.5S</span>
              <span>5.0S</span>
              <span className="hidden xs:inline">7.5S</span>
              <span>10.0S</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-12 sm:col-span-5 lg:col-span-4 flex gap-3 md:gap-4 h-12 md:h-16 order-1 sm:order-2">
            <button
              onClick={() => {
                setMicError(null);
                setIsMicEnabled(!isMicEnabled);
              }}
              className={`flex-none w-12 md:w-16 border-2 flex items-center justify-center transition-all relative ${
                isMicEnabled 
                ? (micError ? 'bg-red-100 border-red-500 text-red-500' : 'bg-green-500 text-bg border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]') 
                : 'bg-bg text-text/40 border-text/10 hover:border-text hover:text-text'
              }`}
              title={isMicEnabled ? "Desactivar Micrófono" : "Activar Micrófono"}
            >
              {isMicEnabled ? <Mic size={24} className="scale-75 md:scale-100" /> : <MicOff size={24} className="scale-75 md:scale-100" />}
              {micError && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-2 py-1 uppercase whitespace-nowrap z-30">
                  {micError}
                </div>
              )}
            </button>
            <button
              onClick={handleToggle}
              className={`flex-1 border-2 border-text font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all duration-200 active:scale-95 ${
                isPlaying 
                ? 'bg-text text-white hover:bg-bg hover:text-text shadow-lg' 
                : 'bg-bg text-text hover:bg-text hover:text-white'
              }`}
            >
              {isPlaying ? 'Detener' : 'Comenzar'}
            </button>
          </div>
        </div>
        
        {/* Signature at the bottom centered */}
        <div className="mt-4 md:mt-8 pb-2 flex justify-center w-full">
          <span className="text-[10px] md:text-sm italic font-medium opacity-60 tracking-tight">by Ale Corvi</span>
        </div>
      </footer>
    </div>
  );
}

