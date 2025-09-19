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

export const MyStudioView: React.FC = () => (
    <div className="p-4 md:p-8 animate-fade-in">
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-white tracking-tight">My Studio</h1>
            <p className="text-gray-400 mt-2">This is your creator dashboard. Manage scheduled rooms, view past history, and prepare drafts.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <h2 className="font-bold text-indigo-400">Scheduled Rooms</h2>
                    <p className="text-gray-300 mt-2 text-sm">You have no upcoming rooms scheduled.</p>
                    <button className="mt-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-full transition">Schedule a Room</button>
                </div>
                <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <h2 className="font-bold text-indigo-400">Past Room History</h2>
                    <p className="text-gray-300 mt-2 text-sm">No past rooms to show.</p>
                </div>
                <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg md:col-span-2">
                    <h2 className="font-bold text-indigo-400">Drafts</h2>
                    <p className="text-gray-300 mt-2 text-sm">You have no saved drafts.</p>
                </div>
            </div>
        </div>
    </div>
);


export const TrendingView = () => <PlaceholderView title="Trending" description="Discover the most popular rooms and topics right now." />;
export const MessagesView = () => <PlaceholderView title="Messages" description="Your private conversations live here." />;
export const ScheduledView = () => <PlaceholderView title="Scheduled" description="Upcoming rooms you've scheduled or bookmarked." />;
export const ProfileView = () => <PlaceholderView title="Profile" description="View and edit your public profile." />;
export const NotificationsView = () => <PlaceholderView title="Notifications" description="Stay up to date with your activity." />;