// Implemented placeholder components for Trending and My Studio views.
import React from 'react';
import { TrendingIcon, StudioIcon } from './Icons';

const PlaceholderCard: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="h-full flex items-center justify-center p-8">
    <div className="text-center text-gray-500">
      <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-400">{title}</h2>
      <p className="mt-2">This feature is coming soon!</p>
    </div>
  </div>
);

export const TrendingView = () => <PlaceholderCard title="Trending Rooms" icon={<TrendingIcon />} />;
export const MyStudioView = () => <PlaceholderCard title="My Studio" icon={<StudioIcon />} />;
