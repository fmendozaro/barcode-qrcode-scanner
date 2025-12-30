import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, ScanLine, AlertCircle, Loader2, Copy, ExternalLink, Box, Tag, Zap } from 'lucide-react';
import { analyzeScannedData } from '../services/geminiService';
import { ScannedItem, DetectedBarcode } from '../types';

interface ScannerProps {
  onScan: (item: ScannedItem) => void;
  lastScannedId?: string;
}

// Simple beep sound generator using Web Audio API to avoid external assets
const playScanSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // macOS-like subtle "glass" ping or clean sine beep
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const Scanner: React.FC<ScannerProps> = ({ onScan, lastScannedId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');

  // Setup Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        setHasPermission(false);
      }
    };

    startCamera();

    // Check BarcodeDetector support
    if (!('BarcodeDetector' in window)) {
      setIsSupported(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Scanning Loop
  useEffect(() => {
    if (!hasPermission || !isSupported || !videoRef.current) return;

    let barcodeDetector: any;
    try {
      barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
      });
    } catch (e) {
      console.warn("BarcodeDetector initialization failed", e);
      setIsSupported(false);
      return;
    }

    let intervalId: number;

    const detect = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isProcessing) return;

      try {
        const barcodes: DetectedBarcode[] = await barcodeDetector.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          const code = barcodes[0];
          
          // Simple debounce based on rawValue + simple time check handled by parent or logic below
          // Here we just ensure we don't spam.
          // In a real app we'd verify 'lastScannedId' more robustly.
          // For now, let's just emit.
          
          handleDetectedCode(code.rawValue, code.format);
        }
      } catch (err) {
        // detection failed usually due to frame issues, ignore
      }
    };

    intervalId = window.setInterval(detect, 500); // 2FPS scanning is usually enough and saves battery
    return () => clearInterval(intervalId);
  }, [hasPermission, isSupported, isProcessing]);

  const handleDetectedCode = useCallback(async (rawValue: string, format: string) => {
     // Prevent duplicate rapid scans of the same item if parent hasn't cleared it or if we are processing
     if (isProcessing) return;
     
     setIsProcessing(true);
     playScanSound(); // Play sound effect
     
     const newItem: ScannedItem = {
       id: crypto.randomUUID(),
       rawValue,
       format,
       timestamp: Date.now(),
       loading: true
     };

     // Immediate feedback to UI
     onScan(newItem);

     // Perform AI Analysis
     try {
       const analysis = await analyzeScannedData(rawValue, format);
       const updatedItem = { ...newItem, aiAnalysis: analysis, loading: false };
       onScan(updatedItem);
     } catch (e) {
       onScan({ ...newItem, loading: false });
     } finally {
       // Cooldown before next scan
       setTimeout(() => setIsProcessing(false), 2000);
     }
  }, [isProcessing, onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDetectedCode(manualInput, 'manual_entry');
    setManualInput('');
  };

  return (
    <div className="h-full flex flex-col bg-black relative">
      {/* Viewfinder */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center group">
        
        {hasPermission === false && (
          <div className="text-center p-6 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500 opacity-80" />
            <p>Camera access denied.</p>
            <p className="text-xs mt-2">Check your system settings.</p>
          </div>
        )}

        {hasPermission && (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-90"
            />
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-64 border border-white/30 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
                
                {/* Scan Line Animation */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="absolute mt-72 text-xs font-medium text-white/70 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                Align code within frame
              </p>
            </div>
          </>
        )}
      </div>

      {/* Controls / Manual Input */}
      <div className="h-auto bg-gray-900/90 backdrop-blur-lg border-t border-white/10 p-4 shrink-0 z-20">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
           <input 
             type="text" 
             value={manualInput}
             onChange={(e) => setManualInput(e.target.value)}
             placeholder={!isSupported ? "Native scanner unsupported. Enter code manually..." : "Enter code manually..."}
             className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 transition-all"
           />
           <button 
             type="submit"
             disabled={isProcessing}
             className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
             Scan
           </button>
        </form>
        {!isSupported && (
          <p className="text-[10px] text-yellow-500/80 mt-2 text-center">
            * Browser does not support BarcodeDetector API. Use manual entry or Chrome/Edge/Android.
          </p>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;