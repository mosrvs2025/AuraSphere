import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, VideoCameraIcon, StopIcon, TrashIcon, PlayIcon, PauseIcon, XIcon } from './Icons';
import VideoRecorderModal from './VideoRecorderModal';

interface DynamicInputProps {
    onSubmitMessage: (text: string) => void;
    onSubmitAudioNote: (duration: number) => void;
    onSubmitVideoNote: () => void;
}

const RECORDING_DURATION = 30;

const DynamicInput: React.FC<DynamicInputProps> = ({ onSubmitMessage, onSubmitAudioNote, onSubmitVideoNote }) => {
    const [text, setText] = useState('');
    const [actionMode, setActionMode] = useState<'audio' | 'video'>('audio');
    const [isModeSelectorOpen, setModeSelectorOpen] = useState(false);
    
    // New state management for audio recording flow
    const [mode, setMode] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [countdown, setCountdown] = useState(RECORDING_DURATION);
    const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);
    const [isVideoRecorderOpen, setVideoRecorderOpen] = useState(false);

    const countdownInterval = useRef<number | null>(null);
    const longPressTimer = useRef<number | null>(null);

    // Countdown Timer Logic
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

    // Effect to stop recording when countdown finishes
    useEffect(() => {
        if (countdown <= 0 && mode === 'recording') {
            finishRecording();
        }
    }, [countdown, mode]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmitMessage(text);
            setText('');
        }
    };
    
    const startRecording = () => {
        if (actionMode === 'audio') {
            setMode('recording');
        } else {
            setVideoRecorderOpen(true);
        }
        setModeSelectorOpen(false);
    };

    const finishRecording = () => {
        setMode('preview');
        setIsAudioPreviewPlaying(false);
    };

    const cancelRecording = () => {
        setMode('idle');
    };

    const deletePreview = () => {
        setMode('idle');
        setIsAudioPreviewPlaying(false);
    };
    
    const sendPreview = () => {
        const recordedDuration = RECORDING_DURATION - countdown;
        onSubmitAudioNote(recordedDuration > 0 ? recordedDuration : 1);
        setMode('idle');
        setIsAudioPreviewPlaying(false);
    };

    const handleActionPress = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = window.setTimeout(() => {
            setModeSelectorOpen(true);
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

    return (
        <>
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
                        <div className="flex items-center text-sm text-gray-300">
                            <span className="relative flex h-2.5 w-2.5 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            Recording audio...
                            <span className="font-mono ml-2 text-gray-400 w-10 text-center">0:{countdown.toString().padStart(2, '0')}</span>
                        </div>
                        <button onClick={finishRecording} className="p-2 text-red-400 hover:text-red-300" aria-label="Stop recording">
                            <StopIcon className="h-8 w-8" />
                        </button>
                    </div>
                )}
                
                {mode === 'preview' && (
                     <div className="w-full flex items-center justify-between p-2 h-[48px]">
                         <button onClick={deletePreview} className="p-2 text-gray-400 hover:text-white" aria-label="Delete recording">
                             <TrashIcon className="h-6 w-6" />
                         </button>
                         <div className="flex items-center flex-1 mx-2">
                            <button onClick={() => setIsAudioPreviewPlaying(!isAudioPreviewPlaying)} className="p-2 text-white">
                                {isAudioPreviewPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                            </button>
                            <div className="flex-1 h-8 flex items-center space-x-1 px-2">
                                {[0.4, 0.6, 0.9, 0.7, 0.8, 0.5, 0.9, 0.4, 0.6, 0.9, 0.7, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                                    <div key={i} style={{ height: `${h * 60}%` }} className="w-1 bg-gray-500 rounded-full"></div>
                                ))}
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
                    onSend={() => {
                        onSubmitVideoNote();
                        setVideoRecorderOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default DynamicInput;