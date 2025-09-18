import React, { useState, useContext, useEffect } from 'react';
import { ChatMessage } from '../types';
import { UserContext } from '../context/UserContext';

interface ListenerControlsProps {
  onSendMessage: (message: { text?: string; voiceMemo?: { duration: number } }) => void;
}

enum RecordingState {
  IDLE,
  RECORDING,
  SUBMITTING,
}

const ListenerControls: React.FC<ListenerControlsProps> = ({ onSendMessage }) => {
  const { currentUser } = useContext(UserContext);
  const [isRecordingPanelOpen, setIsRecordingPanelOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [text, setText] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (recordingState === RecordingState.RECORDING) {
      timer = setTimeout(() => {
        setRecordingState(RecordingState.SUBMITTING);
      }, 3000); // Simulate a 3-second recording
    }
    return () => clearTimeout(timer);
  }, [recordingState]);


  const handleRecordClick = () => {
    setRecordingState(RecordingState.RECORDING);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ text: text.trim() });
      setText('');
    }
  }

  const handleSubmitVoiceMemo = () => {
    onSendMessage({ voiceMemo: { duration: 3 } });
    setRecordingState(RecordingState.IDLE);
    setIsRecordingPanelOpen(false);
  };
  
  const handleCancel = () => {
    setRecordingState(RecordingState.IDLE);
    setIsRecordingPanelOpen(false);
  };


  const renderRecordingPanel = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return (
          <>
            <p className="text-lg font-bold text-red-400">Recording...</p>
            <div className="w-full bg-gray-600 rounded-full h-2.5 my-4">
              <div className="bg-red-500 h-2.5 rounded-full animate-pulse-fast"></div>
            </div>
            <p className="text-xs text-gray-400">Simulating a 3-second voice memo.</p>
          </>
        );
      case RecordingState.SUBMITTING:
        return (
          <>
            <p className="text-lg font-bold text-indigo-400">Ready to Submit?</p>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleCancel} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition">
                Cancel
              </button>
              <button onClick={handleSubmitVoiceMemo} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full transition">
                Submit
              </button>
            </div>
          </>
        );
      case RecordingState.IDLE:
      default:
        return (
          <>
            <p className="text-lg font-bold">Send a Voice Memo</p>
            <p className="text-sm text-gray-400 mb-4">Your message will be sent to the public chat.</p>
            <button onClick={handleRecordClick} className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition focus:outline-none focus:ring-4 focus:ring-red-400/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        );
    }
  };


  return (
    <div className="relative">
      {isRecordingPanelOpen && (
        <div className="absolute bottom-full mb-4 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 flex flex-col items-center text-center animate-slide-up">
           {renderRecordingPanel()}
        </div>
      )}
      <div className="flex items-center justify-between space-x-2">
        <form onSubmit={handleTextSubmit} className="flex-grow flex items-center bg-gray-800 rounded-full">
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message..."
            className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
          />
          <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <button onClick={() => setIsRecordingPanelOpen(!isRecordingPanelOpen)} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition" aria-label="Open voice memo recorder">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ListenerControls;