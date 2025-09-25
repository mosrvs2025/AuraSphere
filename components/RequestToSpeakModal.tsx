import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, StopIcon, TrashIcon, PlayIcon, PauseIcon, VideoCameraIcon } from './Icons';
import VideoRecorderModal from './VideoRecorderModal';

interface RequestToSpeakModalProps {
  onClose: () => void;
  onSubmit: (data: { text?: string; voiceMemo?: { url: string; duration: number }, videoNote?: { url: string, thumbnailUrl: string, duration: number } }) => void;
}

const RequestToSpeakModal: React.FC<RequestToSpeakModalProps> = ({ onClose, onSubmit }) => {
    const [text, setText] = useState('');
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [audioPreview, setAudioPreview] = useState<{ url: string; blob: Blob, duration: number } | null>(null);
    const [videoPreview, setVideoPreview] = useState<{ url: string; duration: number } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recordingStartRef = useRef<number>(0);

    const canSubmit = text.trim().length > 0 || audioPreview !== null || videoPreview !== null;

    useEffect(() => {
        // Cleanup blob URLs on unmount
        return () => {
            if (audioPreview) URL.revokeObjectURL(audioPreview.url);
            if (videoPreview) URL.revokeObjectURL(videoPreview.url);
        };
    }, [audioPreview, videoPreview]);

    const startRecording = async () => {
        setPermissionError(null);
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
            setPermissionError("Microphone access is required to record a voice note. Please grant permission and try again.");
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
        if (videoPreview) URL.revokeObjectURL(videoPreview.url);
        setVideoPreview(null);
        setRecordingState('idle');
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
        }
    };
    
    const handleSubmit = () => {
        if (!canSubmit || isSubmitting) return;
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit({
                text: text.trim() || undefined,
                voiceMemo: audioPreview ? { url: audioPreview.url, duration: audioPreview.duration } : undefined,
                videoNote: videoPreview ? { url: videoPreview.url, duration: videoPreview.duration, thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/300` } : undefined
            });
            if (audioPreview) setAudioPreview(null);
            if (videoPreview) setVideoPreview(null);
        }, 300);
    };

    const handleVideoSend = (url: string, duration: number) => {
        setVideoPreview({ url, duration });
        setIsRecordingVideo(false);
        setRecordingState('preview');
    };
    
  return (
    <>
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

                {permissionError && (
                    <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{permissionError}</p>
                )}

                {recordingState === 'idle' && (
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={startRecording} className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition">
                            <MicIcon className="h-5 w-5 text-indigo-400" />
                            <span>Voice Note</span>
                        </button>
                         <button onClick={() => setIsRecordingVideo(true)} className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition">
                            <VideoCameraIcon className="h-5 w-5 text-purple-400" />
                            <span>Video Clip</span>
                        </button>
                    </div>
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
                
                {recordingState === 'preview' && (
                    <div className="flex items-center justify-between space-x-2 bg-gray-900/50 p-2 rounded-lg">
                        {audioPreview && (
                            <>
                                <audio ref={audioRef} src={audioPreview.url} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                                <button onClick={togglePlay} className="p-2 text-white">
                                    {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                                </button>
                                <div className="flex-1 h-1.5 bg-gray-600 rounded-full"></div>
                                <span className="text-sm font-mono text-gray-400">0:{audioPreview.duration.toString().padStart(2, '0')}</span>
                            </>
                        )}
                         {videoPreview && (
                            <div className="flex items-center space-x-2">
                                <VideoCameraIcon className="h-6 w-6 text-purple-400" />
                                <span className="text-sm font-semibold">Video Clip Attached</span>
                            </div>
                        )}
                        <button onClick={deletePreview} className="p-2 text-gray-400 hover:text-white" aria-label="Delete recording">
                             <TrashIcon className="h-5 w-5" />
                         </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition">Cancel</button>
                <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-5 rounded-full text-sm transition disabled:bg-indigo-800/50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </div>
    </div>
    {isRecordingVideo && <VideoRecorderModal onClose={() => setIsRecordingVideo(false)} onSend={handleVideoSend} />}
    </>
  );
};

export default RequestToSpeakModal;
