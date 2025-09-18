import React, { useState, useContext, useEffect } from 'react';
import { VoiceMemo } from '../types';
import { UserContext } from '../context/UserContext';

interface ListenerControlsProps {
  onSubmitMemo: (memo: VoiceMemo) => void;
}

enum RecordingState {
  IDLE,
  RECORDING,
  SUBMITTING,
}

const ListenerControls: React.FC<ListenerControlsProps> = ({ onSubmitMemo }) => {
  const currentUser = useContext(UserContext);
  const [isRecordingPanelOpen, setIsRecordingPanelOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility, as `setTimeout` in the browser returns a number, not a NodeJS.Timeout object.
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

  const handleSubmit = () => {
    const newMemo: VoiceMemo = {
      id: `memo-${Date.now()}`,
      user: currentUser,
      duration: 3, // Corresponds to the simulated recording time
      createdAt: new Date(),
    };
    onSubmitMemo(newMemo);
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
              <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full transition">
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
            <p className="text-sm text-gray-400 mb-4">Your message will be sent to the host's private queue.</p>
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

      <div className="flex items-center justify-center space-x-4">
        <button onClick={() => setIsRecordingPanelOpen(!isRecordingPanelOpen)} className="p-4 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-transform transform hover:scale-110 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ListenerControls;
