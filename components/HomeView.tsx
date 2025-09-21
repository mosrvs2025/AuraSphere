
import React, { useMemo, useContext } from 'react';
import { DiscoverItem, Room, User } from '../types.ts';
import { DiscoverCard } from './DiscoverCards.tsx';
import { UserContext } from '../context/UserContext.ts';

interface HomeViewProps {
  discoverItems: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

const HomeView: React.FC<HomeViewProps> = (props) => {
    const { discoverItems, ...callbacks } = props;
    const { currentUser } = useContext(UserContext);

    const followingFeed = useMemo(() => {
        const followingIds = new Set(currentUser.following.map(f => f.id));
        return discoverItems.filter(item => {
            if ('author' in item && item.author) {
              return followingIds.has(item.author.id);
            }
            if ('hosts' in item && item.hosts) {
              return item.hosts.some(host => followingIds.has(host.id));
            }
            if (item.type === 'user_profile') {
              return followingIds.has(item.id);
            }
            return false;
      });
    }, [discoverItems, currentUser]);


    // Masonry layout logic
    const columns: DiscoverItem[][] = [[], [], []];
    followingFeed.forEach((item, i) => {
        columns[i % 3].push(item);
    });


    return (
        <div className="flex h-full flex-col">
            <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-10 p-4">
                <h1 className="text-xl font-bold text-center">Home</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
            {followingFeed.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {columns.map((col, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-4">
                    {col.map((item) => (
                        <DiscoverCard
                        key={`${item.type}-${item.id}`}
                        item={item}
                        {...callbacks}
                        />
                    ))}
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 max-w-sm">
                        <h2 className="text-xl font-bold">Your Feed is Quiet</h2>
                        <p className="mt-2">Content from people you follow will appear here. Head over to the Explore tab to find new creators!</p>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
};

export default HomeView;
