import React, { useState, useRef } from 'react';
import { MicIcon, SendIcon, VideoCameraIcon } from './Icons';

interface DynamicInputProps {
    onSubmitMessage: (text: string) => void;
    onStartAudioRecording: () => void;
    onStartVideoRecording: () => void;
}

const DynamicInput: React.FC<DynamicInputProps> = ({ onSubmitMessage, onStartAudioRecording, onStartVideoRecording }) => {
    const [text, setText] = useState('');
    const [actionMode, setActionMode] = useState<'audio' | 'video'>('audio');
    const [isModeSelectorOpen, setModeSelectorOpen] = useState(false);
    
    const pressTimer = useRef<number | null>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmitMessage(text);
            setText('');
        }
    };

    const handleActionClick = () => {
        if (actionMode === 'audio') {
            onStartAudioRecording();
        } else {
            onStartVideoRecording();
        }
        setModeSelectorOpen(false);
    };

    const handlePressStart = () => {
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
        <form onSubmit={handleFormSubmit} className="flex-1 flex items-center bg-gray-800 rounded-full relative">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Send a message..."
                className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
            />
            {renderActionButton()}
        </form>
    );
};

export default DynamicInput;
