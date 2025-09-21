import React from 'react';
import { ActiveView, CurationTab } from '../types';
import { SearchIcon, BellIcon } from './Icons';

interface GlobalHeaderProps {
  activeView: ActiveView;
  curationTab: CurationTab;
  setCurationTab: (tab: CurationTab) => void;
  trendingTags: string[];
  activeTopicTag: string | null;
  setActiveTopicTag: (tag: string | null) => void;
  scrollTop: number;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ 
    activeView, 
    curationTab, 
    setCurationTab,
    trendingTags,
    activeTopicTag,
    setActiveTopicTag,
    scrollTop,
}) => {
  const curationTabs: { id: CurationTab, label: string }[] = [
      { id: 'forYou', label: 'For You' },
      { id: 'following', label: 'Following' },
      { id: 'world', label: 'World' },
      { id: 'local', label: 'Local' },
  ];
  
  return (
    <div className={`sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50 transition-shadow ${scrollTop > 10 ? 'shadow-lg shadow-black/20' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Top-Level Feed Navigation */}
        <div className="flex justify-center items-center h-14">
          {curationTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurationTab(tab.id)}
              className={`px-4 py-2 font-semibold rounded-lg text-base transition-colors relative ${curationTab === tab.id ? 'text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {tab.label}
              {curationTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-white rounded-full"></div>}
            </button>
          ))}
        </div>
        
        {/* Sticky Sub-Navigation Bar (Topic Filter) */}
        {activeView === 'discover' && (
            <div className="py-2 border-t border-gray-800/50">
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <button
                      onClick={() => setActiveTopicTag(null)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                          activeTopicTag === null
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                      All
                  </button>
                  {trendingTags.map(tag => (
                  <button
                      key={tag}
                      onClick={() => setActiveTopicTag(tag)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                          activeTopicTag === tag
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                      {tag}
                  </button>
                  ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GlobalHeader;