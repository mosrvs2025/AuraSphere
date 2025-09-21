
import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { User } from '../types.ts';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (name: string, bio: string, contributionSettings: User['contributionSettings']) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [contributionSettings, setContributionSettings] = useState<User['contributionSettings']>(user.contributionSettings || 'following');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, bio, contributionSettings);
  };
  
  const settingsOptions: { id: User['contributionSettings'], label: string, description: string }[] = [
      { id: 'everyone', label: 'Everyone', description: 'Any user can send you a contribution request.' },
      { id: 'following', label: 'People You Follow', description: 'Only users you follow can send requests.' },
      { id: 'none', label: 'No One', description: 'Disable contribution requests entirely.' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg m-4 text-white shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contribution Settings</label>
            <fieldset className="space-y-2">
                <legend className="sr-only">Who can contribute to your profile?</legend>
                {settingsOptions.map((option) => (
                    <div key={option.id} className="relative flex items-start bg-gray-900/50 p-3 rounded-lg">
                        <div className="flex items-center h-5">
                            <input
                                id={option.id}
                                name="contribution-setting"
                                type="radio"
                                checked={contributionSettings === option.id}
                                onChange={() => setContributionSettings(option.id)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-600 bg-gray-700"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor={option.id} className="font-medium text-white">{option.label}</label>
                            <p className="text-gray-400">{option.description}</p>
                        </div>
                    </div>
                ))}
            </fieldset>
          </div>
           <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-full transition text-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;