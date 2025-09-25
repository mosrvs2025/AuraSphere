import React, { useState } from 'react';
import { User, VisibilitySetting } from '../types.ts';
import { GlobeIcon, UsersIcon, ShieldCheckIcon, UserPlusIcon } from './Icons';

interface PrivacyDashboardProps {
  user: User;
  onUpdateUser: (userData: Partial<User>) => void;
  onBack: () => void;
}

type ContentType = 'liveStreams' | 'pictures' | 'posts' | 'profileInfo';

const visibilityOptions: { id: VisibilitySetting, label: string, icon: React.ReactNode }[] = [
    { id: 'public', label: 'Public', icon: <GlobeIcon className="w-5 h-5" /> },
    { id: 'followers', label: 'Followers', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'groups', label: 'Specific Groups', icon: <UserPlusIcon className="w-5 h-5" /> },
    { id: 'private', label: 'Only Me', icon: <ShieldCheckIcon className="w-5 h-5" /> },
];

const contentTypes: { id: ContentType, label: string }[] = [
    { id: 'liveStreams', label: 'Live Streams' },
    { id: 'pictures', label: 'Pictures' },
    { id: 'posts', label: 'Posts' },
    { id: 'profileInfo', label: 'Profile Info' },
];

const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({ user, onUpdateUser, onBack }) => {
    const [settings, setSettings] = useState(user.privacySettings);

    const handleSettingChange = (contentType: ContentType, newVisibility: VisibilitySetting) => {
        setSettings(prev => {
            if (!prev) return prev;
            const updatedSettings = {
                ...prev,
                [contentType]: { ...prev[contentType], visibility: newVisibility },
            };
            // In a real app, this would be debounced or saved via a button click
            onUpdateUser({ privacySettings: updatedSettings }); 
            return updatedSettings;
        });
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in max-w-4xl mx-auto">
            <header className="mb-6 flex items-center">
                <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center space-x-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span>Back to Profile</span>
                </button>
            </header>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Privacy Dashboard</h1>
                <p className="text-gray-400 mt-2">Control who can see your content and profile information.</p>
            </div>

            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg border border-gray-700/50">
                <h2 className="text-xl font-bold mb-4">Who Sees What?</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Content Type</th>
                                {visibilityOptions.map(opt => (
                                    <th key={opt.id} scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">
                                        <div className="flex flex-col items-center">{opt.icon}<span>{opt.label}</span></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50 bg-gray-900/30">
                            {contentTypes.map((contentType) => (
                                <tr key={contentType.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{contentType.label}</td>
                                    {visibilityOptions.map(option => (
                                        <td key={option.id} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                            <input
                                                type="radio"
                                                name={contentType.id}
                                                checked={settings?.[contentType.id]?.visibility === option.id}
                                                onChange={() => handleSettingChange(contentType.id, option.id)}
                                                className="h-5 w-5 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <div className="mt-8 bg-gray-800/50 p-4 sm:p-6 rounded-lg border border-gray-700/50">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Manage Groups</h2>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full text-sm">Create Group</button>
                </div>
                <div className="mt-4 space-y-2">
                    {user.groups?.map(group => (
                        <div key={group.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{group.name}</p>
                                <p className="text-xs text-gray-400">{group.members.length} members</p>
                            </div>
                            <button className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">Edit</button>
                        </div>
                    ))}
                    {(!user.groups || user.groups.length === 0) && (
                        <p className="text-gray-500 text-center py-4">You haven't created any groups yet.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default PrivacyDashboard;