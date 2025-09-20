import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { TrashIcon } from './Icons';

interface VideoRecorderModalProps {
  onClose: () => void;
  onSend: (url: string, duration: number) => void;
  children?: React.ReactNode;
}

const RECORDING_DURATION = 30;

const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ onClose, onSend, children }) => {
  const [mode, setMode] = useState<'loading' | 'recording' | 'preview' | 'denied'>('loading');
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);

  const cleanup = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(videoBlob);
          setVideoPreviewUrl(url);
          setMode('preview');
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
          // CRITICAL FIX: Stop the stream tracks to release camera/mic after recording finishes.
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMode('recording');

        // Start countdown
        countdownIntervalRef.current = window.setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              stopRecording();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } catch (err) {
        console.error("Camera access denied:", err);
        setMode('denied');
      }
    };

    startRecording();
    return cleanup;
  }, []);

  const handleSend = () => {
    if (videoPreviewUrl) {
      const duration = RECORDING_DURATION - countdown;
      onSend(videoPreviewUrl, duration > 0 ? duration : 1);
      // The parent now owns the URL, so we shouldn't revoke it here on close.
      // Setting state to null is enough to prevent our own cleanup from revoking it.
      setVideoPreviewUrl(null); 
    }
    onClose();
  };

  const handleDiscard = () => {
    onClose();
  };

  // FIX: Use a portal to render the modal at the top level of the DOM. This prevents it from being clipped by parent container styles (e.g., in DMs).
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in p-4">
      
      {/* Header */}
      {/* FIX: Removed redundant 'X' close button from recording/preview states to avoid confusion. It is kept for loading/denied states to allow the user to escape. */}
      <header className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        {mode === 'recording' && (
          <div className="flex items-center text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full font-mono text-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            0:{countdown.toString().padStart(2, '0')}
          </div>
        )}
        {(mode === 'denied' || mode === 'loading') && (
            <button onClick={onClose} className="text-white text-3xl font-bold ml-auto">&times;</button>
        )}
      </header>

      {/* Main Content */}
      <div className="w-full max-w-sm aspect-[9/16] bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={mode !== 'preview'}
          loop={mode === 'preview'}
          controls={mode === 'preview'}
          src={mode === 'preview' ? videoPreviewUrl || '' : undefined}
        />
        {children}
        {mode === 'loading' && <p>Starting camera...</p>}
        {mode === 'denied' && <div className="p-4 text-center"><p>Camera access denied.</p><p className="text-sm mt-2">Please enable camera and microphone permissions in your browser settings.</p></div>}
      </div>
      
      {/* Footer Controls */}
      <footer className="absolute bottom-10 flex items-center justify-center w-full z-10">
        {mode === 'recording' ? (
          <button 
            onClick={stopRecording}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-600 ring-4 ring-white/30"
            aria-label="Stop recording"
          >
            <div className="w-8 h-8 bg-red-600 rounded-md"></div>
          </button>
        ) : mode === 'preview' ? (
          <div className="flex items-center space-x-8">
            <button onClick={handleDiscard} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full text-white transition" aria-label="Discard video">
              <TrashIcon className="w-6 h-6" />
            </button>
            <button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full transition">
              Send
            </button>
          </div>
        ) : null}
      </footer>
    </div>,
    document.body
  );
};

export default VideoRecorderModal;
