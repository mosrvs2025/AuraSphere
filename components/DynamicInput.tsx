import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, VideoCameraIcon, StopIcon } from './Icons';
import VideoRecorderModal from './VideoRecorderModal';

interface DynamicInputProps {
    onSubmitMessage: (text: string) => void;
    onSubmitAudioNote: () => void;
    onSubmitVideoNote: () => void;
}

const RECORDING_DURATION = 30;

const DynamicInput: React.FC<DynamicInputProps> = ({ onSubmitMessage, onSubmitAudioNote, onSubmitVideoNote }) => {
    const [text, setText] = useState('');
    const [actionMode, setActionMode] = useState<'audio' | 'video'>('audio');
    const [isModeSelectorOpen, setModeSelectorOpen] = useState(false);
    
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording'>('idle');
    const [countdown, setCountdown] = useState(RECORDING_DURATION);
    const [isVideoRecorderOpen, setVideoRecorderOpen] = useState(false);

    const pressTimer = useRef<number | null>(null);
    const countdownInterval = useRef<number | null>(null);

    // Countdown Timer Logic
    useEffect(() => {
        if (recordingStatus === 'recording') {
            countdownInterval.current = window.setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
            setCountdown(RECORDING_DURATION);
        }

        return () => {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
        };
    }, [recordingStatus]);

    // Effect to stop recording when countdown finishes
    useEffect(() => {
        if (countdown <= 0) {
            stopAudioRecording(true); // Auto-send when timer finishes
        }
    }, [countdown]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmitMessage(text);
            setText('');
        }
    };
    
    const startAudioRecording = () => {
        console.log('Start audio recording...');
        setRecordingStatus('recording');
    };

    const stopAudioRecording = (autoSend: boolean = false) => {
        console.log('Stop audio recording...');
        setRecordingStatus('idle');
        if (autoSend) {
             onSubmitAudioNote();
        }
    };
    
    const handleActionClick = () => {
        if (recordingStatus === 'recording') {
            stopAudioRecording(true); // Send on tap stop
            return;
        }

        if (actionMode === 'audio') {
            startAudioRecording();
        } else {
            setVideoRecorderOpen(true);
        }
        setModeSelectorOpen(false);
    };

    const handlePressStart = () => {
        if(recordingStatus !== 'idle') return;
        pressTimer.current = window.setTimeout(() => {
            setModeSelectorOpen(true);
        }, 500); // 500ms long press
    };

    const handlePressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const selectMode = (mode: 'audio' | 'video') => {
        setActionMode(mode);
        setModeSelectorOpen(false);
    };

    const renderActionButton = () => {
        if (text.trim()) {
            return (
                <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
                    <SendIcon />
                </button>
            );
        }

        if (recordingStatus === 'recording') {
            return (
                <div className="flex items-center">
                    <span className="text-red-400 font-mono text-sm px-2">0:{countdown.toString().padStart(2, '0')}</span>
                    <button type="button" onClick={() => stopAudioRecording(true)} className="p-3 text-red-400 hover:text-red-300" aria-label="Stop recording">
                        <StopIcon />
                    </button>
                </div>
            );
        }


        return (
            <div className="relative">
                 {isModeSelectorOpen && (
                    <div className="absolute bottom-full right-0 mb-2 flex flex-col items-center bg-gray-900 border border-gray-700 p-1 rounded-lg shadow-lg z-10 space-y-1">
                        <button 
                            onClick={() => selectMode('audio')}
                            className={`p-2 rounded-md ${actionMode === 'audio' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
                            aria-label="Switch to audio mode"
                        >
                            <MicIcon className="text-white" />
                        </button>
                         <button 
                            onClick={() => selectMode('video')}
                            className={`p-2 rounded-md ${actionMode === 'video' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
                            aria-label="Switch to video mode"
                        >
                            <VideoCameraIcon className="text-white" />
                        </button>
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleActionClick}
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    className="p-3 text-gray-300 hover:text-white"
                    aria-label={actionMode === 'audio' ? 'Record audio note' : 'Record video note'}
                >
                    {actionMode === 'audio' ? <MicIcon /> : <VideoCameraIcon />}
                </button>
            </div>
        );
    };

    return (
        <>
            <form onSubmit={handleFormSubmit} className="flex-1 flex items-center bg-gray-800 rounded-full relative">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={recordingStatus === 'recording' ? 'Recording audio...' : 'Send a message...'}
                    disabled={recordingStatus === 'recording'}
                    className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none disabled:text-gray-500"
                />
                {renderActionButton()}
            </form>
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