import React from 'react';

const PlaceholderView: React.FC<{title: string; description: string}> = ({ title, description }) => (
  <div className="p-8 animate-fade-in">
    <div className="max-w-md">
        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-gray-400 mt-2">{description}</p>
        <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-center text-gray-300">Content for this section is coming soon!</p>
        </div>
    </div>
  </div>
);

export const TrendingView = () => <PlaceholderView title="Trending" description="Discover the most popular rooms and topics right now." />;
export const MessagesView = () => <PlaceholderView title="Messages" description="Your private conversations live here." />;
export const ScheduledView = () => <PlaceholderView title="Scheduled" description="Upcoming rooms you've scheduled or bookmarked." />;
export const ProfileView = () => <PlaceholderView title="Profile" description="View and edit your public profile." />;
export const NotificationsView = () => <PlaceholderView title="Notifications" description="Stay up to date with your activity." />;
