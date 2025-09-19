import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, VideoCameraIcon, StopIcon, TrashIcon, PlayIcon, PauseIcon, XIcon } from './Icons';
import VideoRecorderModal from './VideoRecorderModal';

interface DynamicInputProps {
    onSubmitMessage: (text: string) => void;
    onSubmitAudioNote: (url: string, duration: number) => void;
    onSubmitVideoNote: (url: string, duration: number) => void;
}

const RECORDING_DURATION = 30;

const DynamicInput: React.FC<DynamicInputProps> = ({ onSubmitMessage, onSubmitAudioNote, onSubmitVideoNote }) => {
    const [text, setText] = useState('');
    const [actionMode, setActionMode] = useState<'audio' | 'video'>('audio');
    const [isModeSelectorOpen, setModeSelectorOpen] = useState(false);
    
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
    const longPressTimer = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);


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
    
    const startRecording = async () => {
        if (actionMode === 'audio') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;

                // Setup visualizer
                const context = new (window.AudioContext)();
                audioContextRef.current = context;
                const source = context.createMediaStreamSource(stream);
                const analyserNode = context.createAnalyser();
                analyserNode.fftSize = 128;
                source.connect(analyserNode);
                analyserRef.current = analyserNode;

                // Setup recorder
                audioChunksRef.current = [];
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                
                recorder.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };
                
                recorder.onstop = () => {
                    const mimeType = recorder.mimeType || 'audio/webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                    audioChunksRef.current = [];
                    if (audioBlob.size > 0) {
                        const audioUrl = URL.createObjectURL(audioBlob);
                        setAudioPreview({ url: audioUrl, blob: audioBlob });
                        setMode('preview');
                    } else {
                        console.warn("Recording resulted in an empty audio file.");
                        setMode('idle');
                    }
                };
                
                recorder.start();
                setMode('recording');
                visualize();

            } catch (err) {
                console.error("Mic access denied:", err);
            }
        } else {
            setVideoRecorderOpen(true);
        }
        setModeSelectorOpen(false);
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.onstop = null; // Prevent preview creation
            mediaRecorderRef.current.stop();
        }
        cleanupAudioContext();
        stopMediaStream();
        audioChunksRef.current = [];
        setMode('idle');
    };

    const deletePreview = () => {
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
            // URL is now owned by parent, don't revoke here.
            setAudioPreview(null);
        }
        cleanupAudioContext();
        setMode('idle');
        setIsAudioPreviewPlaying(false);
    };
    
    const handleActionPress = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = window.setTimeout(() => {
            if (mode === 'idle') {
                setModeSelectorOpen(true);
            }
            longPressTimer.current = null;
        }, 500);
    };

    const handleActionRelease = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
            if (mode === 'idle') {
                startRecording();
            }
        }
    };
    
    const selectMode = (newMode: 'audio' | 'video') => {
        setActionMode(newMode);
        setModeSelectorOpen(false);
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

    return (
        <>
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
                            placeholder="Send a message..."
                            className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
                        />
                        {text.trim() ? (
                            <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
                                <SendIcon />
                            </button>
                        ) : (
                            <div className="relative">
                                 {isModeSelectorOpen && (
                                    <div className="absolute bottom-full right-0 mb-2 flex flex-col items-center bg-gray-900 border border-gray-700 p-1 rounded-lg shadow-lg z-10 space-y-1">
                                        <button onClick={() => selectMode('audio')} className={`p-2 rounded-md ${actionMode === 'audio' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`} aria-label="Switch to audio mode">
                                            <MicIcon className="text-white" />
                                        </button>
                                         <button onClick={() => selectMode('video')} className={`p-2 rounded-md ${actionMode === 'video' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`} aria-label="Switch to video mode">
                                            <VideoCameraIcon className="text-white" />
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onMouseDown={handleActionPress}
                                    onMouseUp={handleActionRelease}
                                    onTouchStart={handleActionPress}
                                    onTouchEnd={handleActionRelease}
                                    onMouseLeave={handleActionRelease}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="p-3 text-gray-300 hover:text-white"
                                    aria-label={actionMode === 'audio' ? 'Tap to record audio, hold to switch mode' : 'Tap to record video, hold to switch mode'}
                                >
                                    {actionMode === 'audio' ? <MicIcon /> : <VideoCameraIcon />}
                                </button>
                            </div>
                        )}
                    </form>
                )}

                {mode === 'recording' && (
                    <div className="w-full flex items-center justify-between px-2 h-[48px]">
                        <button onClick={cancelRecording} className="p-2 text-gray-400 hover:text-white" aria-label="Cancel recording">
                            <XIcon className="h-6 w-6" />
                        </button>

                        <div className="flex items-center text-sm text-gray-300 flex-1 justify-center">
                             <div className="flex items-center space-x-0.5 h-6 mr-3">
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const sampleIndex = Math.floor(i * (dataArray.length / 24));
                                    const value = dataArray[sampleIndex] || 0;
                                    const heightPercent = Math.max(5, (value / 255) * 100); 
                                    return (
                                        <div 
                                            key={i} 
                                            className="w-0.5 bg-red-400 rounded-full" 
                                            style={{ height: `${heightPercent}%`, transition: 'height 75ms ease-out' }}
                                        />
                                    );
                                })}
                            </div>
                            <span className="font-mono text-gray-400 w-10 text-center">0:{countdown.toString().padStart(2, '0')}</span>
                        </div>
                        
                        <button onClick={finishRecording} className="p-2 text-red-400 hover:text-red-300" aria-label="Stop recording">
                            <StopIcon className="h-8 w-8" />
                        </button>
                    </div>
                )}
                
                {mode === 'preview' && audioPreview && (
                     <div className="w-full flex items-center justify-between p-2 h-[48px]">
                         <button onClick={deletePreview} className="p-2 text-gray-400 hover:text-white" aria-label="Delete recording">
                             <TrashIcon className="h-6 w-6" />
                         </button>
                         <div className="flex items-center flex-1 mx-2">
                            <button onClick={toggleAudioPreview} className="p-2 text-white">
                                {isAudioPreviewPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                            </button>
                             <div className="flex-1 h-8 flex items-center space-x-0.5 px-2">
                                {Array.from({ length: 24 }).map((_, i) => {
                                        const sampleIndex = Math.floor(i * (dataArray.length / 24));
                                        const value = dataArray[sampleIndex] || 0;
                                        const heightPercent = Math.max(5, (value / 255) * 100); 
                                        return (
                                            <div 
                                                key={i} 
                                                className="w-0.5 bg-gray-500 rounded-full" 
                                                style={{ height: `${heightPercent}%`, transition: 'height 75ms ease-out' }}
                                            />
                                        );
                                })}
                            </div>
                             <span className="text-sm font-mono text-gray-400">0:{(RECORDING_DURATION - countdown).toString().padStart(2, '0')}</span>
                         </div>
                         <button onClick={sendPreview} className="p-3 text-white bg-indigo-600 rounded-full hover:bg-indigo-500" aria-label="Send audio note">
                             <SendIcon />
                         </button>
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