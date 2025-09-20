import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, StopIcon, TrashIcon, SendIcon } from './Icons';
import AudioPlayer from './AudioPlayer';

interface CreateVoiceNoteViewProps {
  onPost: (data: { caption: string; voiceMemo: { url: string; duration: number } }, scheduleDate?: Date) => void;
  onClose: () => void;
}

const RECORDING_MAX_DURATION = 60; // 60 seconds

const CreateVoiceNoteView: React.FC<CreateVoiceNoteViewProps> = ({ onPost, onClose }) => {
  const [caption, setCaption] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [mode, setMode] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [countdown, setCountdown] = useState(RECORDING_MAX_DURATION);
  const [audioPreview, setAudioPreview] = useState<{ url: string; blob: Blob } | null>(null);
  
  const countdownInterval = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => { // Cleanup on unmount
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        if (audioPreview) URL.revokeObjectURL(audioPreview.url);
    };
  }, [audioPreview]);

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        
        recorder.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        };
        
        recorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
            if (audioBlob.size > 0) {
                setAudioPreview({ url: URL.createObjectURL(audioBlob), blob: audioBlob });
                setMode('preview');
            } else {
                setMode('idle');
            }
        };
        
        recorder.start();
        setMode('recording');
        
        countdownInterval.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    stopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

    } catch (err) {
        console.error("Mic access denied:", err);
        alert("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };
  
  const deletePreview = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview.url);
    setAudioPreview(null);
    setCountdown(RECORDING_MAX_DURATION);
    setMode('idle');
  };

  const handlePost = () => {
    if (!audioPreview) return;
    const duration = RECORDING_MAX_DURATION - countdown;
    onPost(
        { caption, voiceMemo: { url: audioPreview.url, duration } }, 
        isScheduling && scheduleDate ? new Date(scheduleDate) : undefined
    );
    // Parent now owns the URL, prevent cleanup from revoking
    setAudioPreview(null);
  };
  
  const getMinScheduleDate = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      return now.toISOString().slice(0, 16);
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-white font-semibold text-sm">Cancel</button>
        <h1 className="text-lg font-bold">New Voice Note</h1>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 p-4 flex flex-col justify-between">
        <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption... (optional)"
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-base"
        />

        <div className="flex flex-col items-center justify-center my-8">
            {mode === 'idle' && (
                <button onClick={startRecording} className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white ring-4 ring-red-600/30 hover:bg-red-500 transition-colors">
                    <MicIcon className="w-12 h-12" />
                </button>
            )}
            {mode === 'recording' && (
                <div className="flex flex-col items-center space-y-4">
                    <p className="font-mono text-2xl text-gray-400">0:{countdown.toString().padStart(2, '0')}</p>
                    <button onClick={stopRecording} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white">
                        <StopIcon className="w-10 h-10" />
                    </button>
                </div>
            )}
            {mode === 'preview' && audioPreview && (
                <div className="w-full flex flex-col items-center space-y-4">
                    <div className="w-full">
                        <AudioPlayer src={audioPreview.url} />
                    </div>
                    <button onClick={deletePreview} className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                        <span>Delete Recording</span>
                    </button>
                </div>
            )}
        </div>
      </main>

      <footer className="p-4 flex-shrink-0 space-y-4">
        <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
                <label htmlFor="schedule-toggle" className="font-medium text-gray-300 cursor-pointer">Schedule for Later</label>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isScheduling} onChange={(e) => setIsScheduling(e.target.checked)} id="schedule-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
            </div>
            {isScheduling && (
                <div className="mt-4 animate-fade-in">
                    <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} min={getMinScheduleDate()} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3" />
                </div>
            )}
        </div>
        <button onClick={handlePost} disabled={mode !== 'preview' || (isScheduling && !scheduleDate)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full text-lg transition disabled:bg-indigo-800/50">
          {isScheduling ? 'Schedule Note' : 'Post Now'}
        </button>
      </footer>
    </div>
  );
};

export default CreateVoiceNoteView;
