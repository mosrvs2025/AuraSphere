
import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { Room, ChatMessage } from '../types.ts';
import { generateIcebreakers, summarizeChat } from '../services/geminiService.ts';
// FIX: Corrected import path for Icons.
import { SparklesIcon, DocumentTextIcon, XIcon } from './Icons.tsx';

interface AiAssistantPanelProps {
  room: Room;
  messages: ChatMessage[];
  onClose: () => void;
}

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ room, messages, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'starters' | 'summary', content: string[] | string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestStarters = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const suggestions = await generateIcebreakers(room.title);
      setResult({ type: 'starters', content: suggestions });
    } catch (e) {
      setError('Failed to generate suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeChat = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const summary = await summarizeChat(messages);
      setResult({ type: 'summary', content: summary });
    } catch (e) {
      setError('Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-20 right-4 w-full max-w-sm bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-20 animate-fade-in text-white">
      <header className="flex justify-between items-center p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-indigo-400" />
          <h3 className="font-bold">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <XIcon className="h-5 w-5" />
        </button>
      </header>
      <div className="p-3">
        <p className="text-sm text-gray-400 mb-3">Your AI-powered toolkit for hosting.</p>
        <div className="space-y-2">
          <button onClick={handleSuggestStarters} disabled={isLoading} className="w-full flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition disabled:opacity-50">
            <SparklesIcon className="h-5 w-5" />
            <span>Suggest Starters</span>
          </button>
          <button onClick={handleSummarizeChat} disabled={isLoading || messages.length < 2} className="w-full flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed">
            <DocumentTextIcon className="h-5 w-5" />
            <span>Summarize Chat</span>
          </button>
        </div>
        
        {isLoading && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <svg className="animate-spin mx-auto h-5 w-5 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </div>
        )}

        {error && <p className="mt-4 text-red-400 text-xs text-center">{error}</p>}

        {result && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-md max-h-48 overflow-y-auto">
            {result.type === 'starters' && Array.isArray(result.content) && (
              <>
                <h4 className="font-bold text-indigo-400 mb-2 text-sm">Conversation Starters:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                  {result.content.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </>
            )}
            {result.type === 'summary' && typeof result.content === 'string' && (
              <>
                <h4 className="font-bold text-indigo-400 mb-2 text-sm">Chat Summary:</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.content}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistantPanel;