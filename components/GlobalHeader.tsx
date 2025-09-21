import React from 'react';
import { User, CurationTab } from '../types';
import { FilterIcon } from './Icons';

interface GlobalHeaderProps {
  onFilterClick: () => void;
  curationTab: CurationTab;
  onCurationTabChange: (tab: CurationTab) => void;
  trendingTags: string[];
  activeTopicTag: string;
  onTopicTagChange: (tag: string) => void;
}

const curationTabs: { id: CurationTab, label: string }[] = [
    { id: 'forYou', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'world', label: 'World' },
    { id: 'local', label: 'Local' },
];

const GlobalHeader: React.FC<GlobalHeaderProps> = (props) => {
  const { onFilterClick, curationTab, onCurationTabChange, trendingTags, activeTopicTag, onTopicTagChange } = props;
  
  return (
    <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
            <button onClick={onFilterClick} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors" aria-label="Open filters">
                <FilterIcon className="w-6 h-6" />
            </button>
             <nav className="flex space-x-6">
                {curationTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => onCurationTabChange(tab.id)}
                        className={`font-semibold transition-colors ${curationTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="w-10"></div> {/* Spacer to balance the filter icon */}
        </div>
        
        {/* Sticky Sub-Navigation */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
             <div className="flex items-center space-x-2">
                {trendingTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => onTopicTagChange(tag)}
                        className={`px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                            activeTopicTag === tag 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                       {tag.startsWith('#') ? tag : `# ${tag}`}
                    </button>
                ))}
            </div>
        </div>
    </header>
  );
};

export default GlobalHeader;
