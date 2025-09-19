import React from 'react';
// FIX: Imported ActiveView to resolve type conflict and handle all possible views.
import { DiscoverItem, Conversation, Room, User, ChatMessage, ActiveView } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface GlobalSearchViewProps {
  query: string;
  activeView: ActiveView;
  discoverItems: DiscoverItem[];
  conversations: Conversation[];
  currentUser: User;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
  onConversationSelect: (conversation: Conversation) => void;
}

const MessageSearchResult: React.FC<{ 
    conversation: Conversation, 
    matchingMessage: ChatMessage, 
    currentUser: User, 
    onClick: () => void 
}> = ({ conversation, matchingMessage, currentUser, onClick }) => {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
    if (!otherParticipant) return null;

    return (
        <button onClick={onClick} className="w-full flex items-start p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-colors text-left space-x-3">
            <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
                <p className="font-bold text-white truncate">{otherParticipant.name}</p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    <span className="font-semibold text-gray-300">{matchingMessage.user.id === currentUser.id ? "You: " : ""}</span>
                    {matchingMessage.text}
                </p>
            </div>
        </button>
    );
};

const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  query,
  activeView,
  discoverItems,
  conversations,
  currentUser,
  onEnterRoom,
  onViewProfile,
  onViewMedia,
  onViewPost,
  onConversationSelect
}) => {
  const lcQuery = query.toLowerCase();

  const renderDiscoverResults = () => {
    const filteredItems = discoverItems.filter(item => {
      switch (item.type) {
        case 'live_room':
          return item.title.toLowerCase().includes(lcQuery) || item.description?.toLowerCase().includes(lcQuery);
        case 'user_profile':
          return item.name.toLowerCase().includes(lcQuery) || item.bio?.toLowerCase().includes(lcQuery);
        case 'text_post':
          return item.content.toLowerCase().includes(lcQuery) || item.author.name.toLowerCase().includes(lcQuery);
        case 'image_post':
        case 'video_post':
          return item.caption?.toLowerCase().includes(lcQuery) || item.author.name.toLowerCase().includes(lcQuery);
        default:
          return false;
      }
    });

    const columns = [[], [], []] as DiscoverItem[][];
    filteredItems.forEach((item, i) => {
        columns[i % 3].push(item);
    });

    if (filteredItems.length === 0) {
        return <div className="text-center text-gray-400 py-10">No results found for "{query}".</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-4">
                {col.map((item) => (
                    <DiscoverCard 
                      key={`${item.type}-${item.id}`} 
                      item={item}
                      onEnterRoom={onEnterRoom}
                      onViewProfile={onViewProfile}
                      onViewMedia={onViewMedia}
                      onViewPost={onViewPost}
                    />
                ))}
                </div>
            ))}
        </div>
    );
  };
  
  const renderMessagesResults = () => {
    const results: { conversation: Conversation, message: ChatMessage }[] = [];
    conversations.forEach(convo => {
        convo.messages.forEach(msg => {
            if (msg.text?.toLowerCase().includes(lcQuery)) {
                results.push({ conversation: convo, message: msg });
            }
        });
    });

     if (results.length === 0) {
        return <div className="text-center text-gray-400 py-10">No messages found for "{query}".</div>
    }

    return (
        <div className="space-y-2 max-w-2xl mx-auto">
            {results.map(({ conversation, message }) => (
                <MessageSearchResult 
                    key={message.id}
                    conversation={conversation}
                    matchingMessage={message}
                    currentUser={currentUser}
                    onClick={() => onConversationSelect(conversation)}
                />
            ))}
        </div>
    );
  };


  return (
    <div className="p-4 md:p-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
            {/* FIX: Default to discover results unless the view is explicitly 'messages' to handle all ActiveView types. */}
            {activeView === 'messages' ? renderMessagesResults() : renderDiscoverResults()}
        </div>
    </div>
  );
};

export default GlobalSearchView;