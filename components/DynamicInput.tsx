
import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for Icons.
import { MicIcon, SendIcon, VideoCameraIcon, StopIcon, TrashIcon, PlayIcon, PauseIcon, ImageIcon } from './Icons.tsx';
import VideoRecorderModal from './VideoRecorderModal.tsx';

interface DynamicInputProps {
    onSubmitMessage: (text: string) => void;
    onSubmitAudioNote: (url: string, duration: number) => void;
    onSubmitVideoNote: (url: string, duration: number) => void;
    // New prop for image replies
    onSubmitImage?: (file: File) => void;
}

const RECORDING_DURATION = 30;

const DynamicInput: React.FC<DynamicInputProps> = ({ onSubmitMessage, onSubmitAudioNote, onSubmitVideoNote, onSubmitImage }) => {
    const [text, setText] = useState('');
    
    // Recording flow state
    const [mode, setMode] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [countdown, setCountdown] = useState(RECORDING_DURATION);
    const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
    const [isVideoRecorderOpen, setVideoRecorderOpen] = useState(false);
    const [audioPreview, setAudioPreview] = useState<{ url: string; blob: Blob } | null>(null);

    // Audio visualization state
    const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(0));
    
    // Refs
    const countdownInterval = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);


    // --- Audio Context Cleanup ---
    const cleanupAudioContext = () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        audioContextRef.current = null;
        analyserRef.current = null;
        setDataArray(new Uint8Array(0));
    };

    // --- Stop Media Stream ---
    const stopMediaStream = () => {
         if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }
    
    // --- Countdown Timer Logic ---
    useEffect(() => {
        if (mode === 'recording') {
            countdownInterval.current = window.setInterval(() => {
                setCountdown(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        } else {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
            setCountdown(RECORDING_DURATION);
        }
        return () => {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
        };
    }, [mode]);

    const finishRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        cleanupAudioContext();
        stopMediaStream();
    };

    // Effect to stop recording when countdown finishes
    useEffect(() => {
        if (countdown <= 0 && mode === 'recording') {
            finishRecording();
        }
    }, [countdown, mode]);

    // --- Visualization Logic ---
    const visualize = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const newArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(newArray);
        setDataArray(newArray);

        animationFrameIdRef.current = requestAnimationFrame(visualize);
    };

    const startPlaybackVisualization = () => {
        if (!audioPreviewRef.current || (audioContextRef.current && audioContextRef.current.state !== 'closed')) return;
        
        try {
            const context = new (window.AudioContext)();
            const source = context.createMediaElementSource(audioPreviewRef.current);
            const analyserNode = context.createAnalyser();
            analyserNode.fftSize = 128;
            source.connect(analyserNode);
            analyserNode.connect(context.destination);

            audioContextRef.current = context;
            analyserRef.current = analyserNode;

            visualize();
        } catch (error) {
            console.error("Error setting up playback visualization:", error);
        }
    };

    // --- Handlers ---
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmitMessage(text);
            setText('');
        }
    };
    
    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const context = new (window.AudioContext)();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyserNode = context.createAnalyser();
            analyserNode.fftSize = 128;
            source.connect(analyserNode);
            analyserRef.current = analyserNode;

            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            
            recorder.ondataavailable = event => audioChunksRef.current.push(event.data);
            
            recorder.onstop = () => {
                const mimeType = recorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                audioChunksRef.current = [];
                if (audioBlob.size > 0) {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioPreview({ url: audioUrl, blob: audioBlob });
                    setMode('preview');
                } else {
                    setMode('idle');
                }
            };
            
            recorder.start();
            setMode('recording');
            visualize();

        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required.");
        }
    };

    const deletePreview = () => {
        if (audioPreviewRef.current) {
            audioPreviewRef.current.pause();
            audioPreviewRef.current.src = '';
        }
        if (audioPreview) {
            URL.revokeObjectURL(audioPreview.url);
        }
        setAudioPreview(null);
        cleanupAudioContext();
        setMode('idle');
        setIsAudioPreviewPlaying(false);
    };
    
    const sendPreview = () => {
        if (audioPreview) {
            const recordedDuration = RECORDING_DURATION - countdown;
            onSubmitAudioNote(audioPreview.url, recordedDuration > 0 ? recordedDuration : 1);
            setAudioPreview(null);
        }
        cleanupAudioContext();
        setMode('idle');
        setIsAudioPreviewPlaying(false);
    };

    const toggleAudioPreview = () => {
        if (audioPreviewRef.current) {
            if (isAudioPreviewPlaying) {
                audioPreviewRef.current.pause();
            } else {
                audioPreviewRef.current.play().catch(console.error);
            }
        }
    };

    const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && onSubmitImage) {
            onSubmitImage(event.target.files[0]);
        }
    };

    return (
        <>
            <input type="file" ref={imageInputRef} onChange={handleImageInputChange} accept="image/*,image/gif" className="hidden" />
            {audioPreview?.url && <audio 
                ref={audioPreviewRef} 
                src={audioPreview.url} 
                onPlay={() => { setIsAudioPreviewPlaying(true); startPlaybackVisualization(); }}
                onPause={() => { setIsAudioPreviewPlaying(false); cleanupAudioContext(); }}
                onEnded={() => { setIsAudioPreviewPlaying(false); cleanupAudioContext(); }}
                preload="auto"
            />}
            <div className="flex-1 flex items-center bg-gray-800 rounded-full relative transition-all duration-300">
                {mode === 'idle' && (
                    <form onSubmit={handleFormSubmit} className="w-full flex items-center">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a reply..."
                            className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
                        />
                         {text.trim() ? (
                            <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
                                <SendIcon />
                            </button>
                        ) : (
                            <div className="flex items-center p-1">
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white" aria-label="Attach an image">
                                    <ImageIcon />
                                </button>
                                <button type="button" onClick={() => setVideoRecorderOpen(true)} className="p-2 text-gray-300 hover:text-white" aria-label="Record a video clip">
                                    <VideoCameraIcon />
                                </button>
                                <button type="button" onClick={startAudioRecording} className="p-2 text-gray-300 hover:text-white" aria-label="Record a voice note">
                                    <MicIcon />
                                </button>
                            </div>
                        )}
                    </form>
                )}

                {mode === 'recording' && (
                    <div className="w-full flex items-center justify-between px-4 h-[48px]">
                        <div className="flex items-center text-sm text-gray-300 flex-1 justify-center">
                             <div className="flex items-center space-x-0.5 h-6 mr-3">
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const sampleIndex = Math.floor(i * (dataArray.length / 24));
                                    const value = dataArray[sampleIndex] || 0;
                                    const heightPercent = Math.max(5, (value / 255) * 100); 
                                    return <div key={i} className="w-0.5 bg-red-400 rounded-full" style={{ height: `${heightPercent}%`, transition: 'height 75ms ease-out' }}/>;
                                })}
                            </div>
                            <span className="font-mono text-gray-400 w-10 text-center">0:{countdown.toString().padStart(2, '0')}</span>
                        </div>
                        <button onClick={finishRecording} className="p-2 text-red-400 hover:text-red-300" aria-label="Stop recording"><StopIcon className="h-8 w-8" /></button>
                    </div>
                )}
                
                {mode === 'preview' && audioPreview && (
                     <div className="w-full flex items-center justify-between p-2 h-[48px]">
                         <button onClick={deletePreview} className="p-2 text-gray-400 hover:text-white" aria-label="Delete recording"><TrashIcon className="h-6 w-6" /></button>
                         <div className="flex items-center flex-1 mx-2">
                            <button onClick={toggleAudioPreview} className="p-2 text-white">{isAudioPreviewPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}</button>
                             <div className="flex-1 h-8 flex items-center space-x-0.5 px-2">
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const sampleIndex = Math.floor(i * (dataArray.length / 24));
                                    const value = dataArray[sampleIndex] || 0;
                                    const heightPercent = Math.max(5, (value / 255) * 100); 
                                    return <div key={i} className="w-0.5 bg-gray-500 rounded-full" style={{ height: `${heightPercent}%`, transition: 'height 75ms ease-out' }} />;
                                })}
                            </div>
                             <span className="text-sm font-mono text-gray-400">0:{(RECORDING_DURATION - countdown).toString().padStart(2, '0')}</span>
                         </div>
                         <button onClick={sendPreview} className="p-3 text-white bg-indigo-600 rounded-full hover:bg-indigo-500" aria-label="Send audio note"><SendIcon /></button>
                     </div>
                )}
            </div>
            {isVideoRecorderOpen && (
                <VideoRecorderModal 
                    onClose={() => setVideoRecorderOpen(false)}
                    onSend={(url, duration) => {
                        onSubmitVideoNote(url, duration);
                        setVideoRecorderOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default DynamicInput;