import React, { useState, useEffect, useRef } from 'react';
import { StopIcon } from './Icons';

interface VideoRecorderModalProps {
  onClose: () => void;
  onSend: () => void;
}

const RECORDING_DURATION = 30;

const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ onClose, onSend }) => {
  const [mode, setMode] = useState<'recording' | 'preview'>('recording');
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  const countdownInterval = useRef<number | null>(null);

  const startCountdown = () => {
    countdownInterval.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    setMode('preview');
  };

  useEffect(() => {
    startCountdown();
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in p-4">
      
      {/* Header with Countdown */}
      <header className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full font-mono text-lg">
          0:{countdown.toString().padStart(2, '0')}
        </div>
        {mode === 'recording' && 
            <button onClick={onClose} className="text-white text-2xl font-bold">&times;</button>
        }
      </header>

      {/* Main Content */}
      <div className="w-full max-w-sm aspect-[9/16] bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500 relative overflow-hidden">
        {mode === 'recording' && <p>Camera Feed Placeholder</p>}
        {mode === 'preview' && <p>Video Preview Placeholder</p>}
      </div>
      
      {/* Footer with Controls */}
      <footer className="absolute bottom-10 flex items-center justify-center w-full">
        {mode === 'recording' ? (
          <button 
            onClick={stopRecording}
            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white"
            aria-label="Stop recording"
          >
            <StopIcon className="w-8 h-8"/>
          </button>
        ) : (
          <div className="flex items-center space-x-8">
            <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full transition">
              Discard
            </button>
            <button onClick={onSend} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-10 rounded-full transition">
              Send
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default VideoRecorderModal;