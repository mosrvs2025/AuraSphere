import React from 'react';
import { DiscoverItem } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface TrendingViewProps {
  items: DiscoverItem[];
}

const TrendingView: React.FC<TrendingViewProps> = ({ items }) => {
  // Simple column-based layout. A real implementation might use a masonry library.
  const columns = [[], [], []] as DiscoverItem[][];
  items.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trending</h1>
        {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-4">
                {col.map((item) => (
                    <DiscoverCard key={`${item.type}-${item.id}`} item={item} />
                ))}
                </div>
            ))}
            </div>
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-gray-300">Nothing is trending</h2>
            <p className="text-gray-400 mt-2">Check back later to see what's popular.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingView;
