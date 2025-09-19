import React, { useState } from 'react';
import { User } from '../types';

interface InviteUsersModalProps {
  followers: User[];
  onClose: () => void;
  onInvite: (userIds: string[]) => void;
  alreadyInvitedUserIds: string[];
}

const InviteUsersModal: React.FC<InviteUsersModalProps> = ({ followers, onClose, onInvite, alreadyInvitedUserIds }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleUser = (userId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSendInvites = () => {
    onInvite(Array.from(selectedIds));
    onClose();
  };

  const alreadyInvitedSet = new Set(alreadyInvitedUserIds);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md m-4 text-white shadow-2xl animate-slide-up flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-4 flex-shrink-0">Invite Followers</h3>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
            {followers.length > 0 ? followers.map(user => {
                const isSelected = selectedIds.has(user.id);
                const isInvited = alreadyInvitedSet.has(user.id);
                const isDisabled = isInvited;

                return (
                    <button
                        key={user.id}
                        onClick={() => handleToggleUser(user.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${
                            isDisabled 
                                ? 'bg-gray-700/50 opacity-50 cursor-not-allowed'
                                : isSelected 
                                ? 'bg-indigo-600' 
                                : 'bg-gray-900 hover:bg-gray-700'
                        }`}
                    >
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                        <div className="flex-1">
                            <p className="font-semibold">{user.name}</p>
                        </div>
                        {isInvited ? (
                            <span className="text-xs text-gray-400 font-semibold">Invited</span>
                        ) : (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-400' : 'border-gray-500'}`}>
                                {isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                        )}
                    </button>
                )
            }) : (
                <p className="text-gray-400 text-center py-8">You don't have any followers to invite yet.</p>
            )}
        </div>

        <div className="flex-shrink-0 pt-4">
            <button
                onClick={handleSendInvites}
                disabled={selectedIds.size === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-full disabled:bg-indigo-800/50 disabled:cursor-not-allowed transition text-lg"
            >
                Send Invites ({selectedIds.size})
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteUsersModal;
