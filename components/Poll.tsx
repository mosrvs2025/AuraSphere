
import React from 'react';
// FIX: Corrected import path for types.
import { Poll as PollType, User } from '../types.ts';

interface PollProps {
  poll: PollType;
  onVote: (optionIndex: number) => void;
  isHost: boolean;
  onEndPoll: () => void;
  currentUser: User;
}

const Poll: React.FC<PollProps> = ({ poll, onVote, isHost, onEndPoll, currentUser }) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
  const userVoteIndex = poll.options.findIndex(opt => opt.votes.includes(currentUser.id));
  const hasVoted = userVoteIndex > -1;

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Live Poll</p>
            <h4 className="font-bold text-white">{poll.question}</h4>
        </div>
        {isHost && poll.isActive && (
            <button onClick={onEndPoll} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-full text-xs">End Poll</button>
        )}
      </div>
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isUserChoice = userVoteIndex === index;

          return (
            <button
              key={index}
              onClick={() => onVote(index)}
              disabled={!poll.isActive}
              className={`w-full text-left p-2 rounded-md transition-colors relative overflow-hidden ${poll.isActive ? 'hover:bg-gray-700/50' : 'cursor-default'} ${hasVoted && isUserChoice ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <div
                className="absolute top-0 left-0 bottom-0 bg-indigo-500/30"
                style={{ width: `${hasVoted || !poll.isActive ? percentage : 0}%`, transition: 'width 0.3s ease-in-out' }}
              />
              <div className="relative z-10 flex justify-between items-center">
                <span className="font-semibold text-sm text-white">{option.text}</span>
                {(hasVoted || !poll.isActive) && (
                  <span className="text-xs text-gray-300 font-bold">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{totalVotes} votes</p>
    </div>
  );
};

export default Poll;
