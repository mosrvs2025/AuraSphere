import React from 'react';

interface FeaturedLinkProps {
  url: string;
  onOpenLink: (url: string) => void;
}

const FeaturedLink: React.FC<FeaturedLinkProps> = ({ url, onOpenLink }) => {
  // Simple URL parsing to get a displayable hostname
  const displayUrl = (rawUrl: string): string => {
    try {
      const urlObject = new URL(rawUrl);
      return urlObject.hostname;
    } catch (e) {
      return rawUrl;
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => onOpenLink(url)}
        className="w-full flex items-center space-x-3 p-3 rounded-lg transition bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 text-left"
      >
        <div className="flex-shrink-0 p-2 bg-gray-700 rounded-md">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
           </svg>
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{displayUrl(url)}</p>
          <p className="text-xs text-gray-400 truncate">{url}</p>
        </div>
        <div className="text-gray-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default FeaturedLink;
