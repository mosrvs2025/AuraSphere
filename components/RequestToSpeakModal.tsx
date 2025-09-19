import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, StopIcon, TrashIcon, PlayIcon, PauseIcon } from './Icons';

interface RequestToSpeakModalProps {
  onClose: () => void;
  onSubmit: (data: { text?: string; voiceMemo?: { url: string; duration: number } }) => void;
}

const RequestToSpeakModal: React.FC<RequestToSpeakModalProps> = ({ onClose, onSubmit }) => {
    const [text, setText] = useState('');
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [audioPreview, setAudioPreview] = useState<{ url: string; blob: Blob, duration: number } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recordingStartRef = useRef<number>(0);

    const canSubmit = text.trim().length > 0 || audioPreview !== null;

    useEffect(() => {
        // Cleanup blob URL on unmount
        return () => {
            if (audioPreview) {
                URL.revokeObjectURL(audioPreview.url);
            }
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
                const duration = (Date.now() - recordingStartRef.current) / 1000;
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size > 0) {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioPreview({ url: audioUrl, blob: audioBlob, duration: Math.round(duration) });
                    setRecordingState('preview');
                } else {
                    setRecordingState('idle');
                }
            };
            
            recordingStartRef.current = Date.now();
            recorder.start();
            setRecordingState('recording');
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required to record a voice note.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    const deletePreview = () => {
        if (audioPreview) URL.revokeObjectURL(audioPreview.url);
        setAudioPreview(null);
        setRecordingState('idle');
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
        }
    };
    
    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            text: text.trim() || undefined,
            voiceMemo: audioPreview ? { url: audioPreview.url, duration: audioPreview.duration } : undefined,
        });
        // The parent component now owns the blob URL, so we nullify it here to prevent our cleanup from revoking it.
        if (audioPreview) setAudioPreview(null);
    };
    
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg m-4 text-white shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Request to Speak</h3>
            <div className="space-y-4">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Add a comment with your request... (optional)"
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    disabled={recordingState !== 'idle'}
                />

                {recordingState === 'idle' && (
                    <button onClick={startRecording} className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition">
                        <MicIcon className="h-5 w-5 text-indigo-400" />
                        <span>Attach a voice note (optional)</span>
                    </button>
                )}
                
                {recordingState === 'recording' && (
                    <div className="flex items-center justify-center space-x-4 bg-gray-900/50 p-3 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-300">Recording...</span>
                        <button onClick={stopRecording} className="p-2 text-red-400 hover:text-red-300" aria-label="Stop recording">
                            <StopIcon className="h-8 w-8" />
                        </button>
                    </div>
                )}
                
                {recordingState === 'preview' && audioPreview && (
                    <div className="flex items-center space-x-2 bg-gray-900/50 p-2 rounded-lg">
                        <audio ref={audioRef} src={audioPreview.url} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                        <button onClick={togglePlay} className="p-2 text-white">
                            {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                        </button>
                        <div className="flex-1 h-1.5 bg-gray-600 rounded-full"></div>
                        <span className="text-sm font-mono text-gray-400">0:{audioPreview.duration.toString().padStart(2, '0')}</span>
                        <button onClick={deletePreview} className="p-2 text-gray-400 hover:text-white" aria-label="Delete recording">
                             <TrashIcon className="h-5 w-5" />
                         </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition">Cancel</button>
                <button onClick={handleSubmit} disabled={!canSubmit} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-5 rounded-full text-sm transition disabled:bg-indigo-800/50 disabled:cursor-not-allowed">
                    Submit Request
                </button>
            </div>
        </div>
    </div>
  );
};

export default RequestToSpeakModal;
