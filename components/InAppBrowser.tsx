
import React from 'react';
// FIX: Corrected import path for Icons.
import { XIcon } from './Icons.tsx';

interface InAppBrowserProps {
  url: string;
  onClose: () => void;
}

const InAppBrowser: React.FC<InAppBrowserProps> = ({ url, onClose }) => {
  
  const displayUrl = (rawUrl: string): string => {
    try {
      const urlObject = new URL(rawUrl);
      return urlObject.hostname;
    } catch (e) {
      return 'Invalid URL';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-slide-up">
      <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between p-2">
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="text-center">
            <p className="text-sm font-semibold text-white">{displayUrl(url)}</p>
        </div>
        <div className="w-10"></div>
      </header>
      <div className="flex-1 bg-white">
        <iframe
          src={url}
          title="In-App Browser"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default InAppBrowser;