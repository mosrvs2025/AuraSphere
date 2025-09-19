import React, { useState, useRef, useEffect } from 'react';

interface ListenerControlsProps {
  onSendMessage: (message: { text?: string; voiceMemo?: { duration: number; blob: Blob } }) => void;
}

enum RecordingState {
  IDLE,
  REQUESTING_PERMISSION,
  RECORDING,
  RECORDED,
  ERROR,
}

const MAX_RECORDING_SECONDS = 30;

const ListenerControls: React.FC<ListenerControlsProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecordingPanelOpen, setIsRecordingPanelOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const resetRecording = () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setRecordingState(RecordingState.IDLE);
      setAudioBlob(null);
      setRecordingDuration(0);
      setErrorMessage(null);
  }
  
  useEffect(() => {
    return () => {
      resetRecording(); // Cleanup on unmount
    };
  }, []);

  const startRecording = async () => {
    resetRecording();
    setRecordingState(RecordingState.REQUESTING_PERMISSION);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecordingState(RecordingState.RECORDED);
        stream.getTracks().forEach(track => track.stop());
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };

      recorder.start();
      setRecordingState(RecordingState.RECORDING);
      setRecordingDuration(0); // Reset duration on start
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
             if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setErrorMessage("Microphone access denied. Please allow microphone permissions in your browser settings.");
      setRecordingState(RecordingState.ERROR);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmitVoiceMemo = () => {
    if (audioBlob) {
      onSendMessage({ voiceMemo: { duration: recordingDuration, blob: audioBlob } });
      resetRecording();
      setIsRecordingPanelOpen(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ text: text.trim() });
      setText('');
    }
  }

  const renderRecordingPanel = () => {
    switch (recordingState) {
        case RecordingState.REQUESTING_PERMISSION:
            return <p className="text-lg font-bold text-gray-400">Requesting microphone...</p>;
        case RecordingState.ERROR:
            return (
                <>
                    <p className="text-lg font-bold text-red-400">Error</p>
                    <p className="text-sm text-gray-300 mt-2 text-center">{errorMessage}</p>
                    <button onClick={() => setRecordingState(RecordingState.IDLE)} className="mt-4 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition">
                        Back
                    </button>
                </>
            );
        case RecordingState.RECORDING:
            const progress = (recordingDuration / MAX_RECORDING_SECONDS) * 100;
            return (
              <>
                <p className="text-lg font-bold text-red-400">Recording...</p>
                 <div className="relative w-24 h-24 my-4 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full bg-gray-700"></div>
                    <div 
                        className="absolute w-full h-full rounded-full transition-all duration-1000" 
                        style={{ background: `conic-gradient(#ef4444 ${progress}%, transparent 0)` }}
                    ></div>
                    <div className="absolute w-[calc(100%-12px)] h-[calc(100%-12px)] rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-xl font-mono text-white">{recordingDuration}s</span>
                    </div>
                </div>
                <button onClick={stopRecording} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition">
                    Stop
                </button>
              </>
            );
        case RecordingState.RECORDED:
            return (
              <>
                <p className="text-lg font-bold text-indigo-400">Memo Recorded ({recordingDuration}s)</p>
                <p className="text-sm text-gray-400 mb-4">Ready to send?</p>
                <div className="flex w-full space-x-4 mt-4">
                  <button onClick={() => setRecordingState(RecordingState.IDLE)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition">
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
                <p className="text-sm text-gray-400 mb-4">Record for up to {MAX_RECORDING_SECONDS} seconds.</p>
                <button onClick={startRecording} className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition focus:outline-none focus:ring-4 focus:ring-red-400/50" aria-label="Start recording">
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
        <button onClick={() => {
            const nextState = !isRecordingPanelOpen;
            setIsRecordingPanelOpen(nextState);
            if (!nextState) { // if panel is closing
                resetRecording();
            }
        }} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition" aria-label="Open voice memo recorder">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ListenerControls;