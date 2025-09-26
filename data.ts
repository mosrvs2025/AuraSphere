
import { User, Room, DiscoverItem, Conversation, Notification, ContributionRequest, Group } from './types.ts';

// --- MOCK USERS ---
// Create base users first, then establish relationships
const user1: User = {
  id: 'user-1',
  name: 'You',
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
  bio: 'Host of Tech Talks & exploring the future of audio. Lover of all things open source.',
  followers: [],
  following: [],
  contributionSettings: 'following',
   privacySettings: {
    liveStreams: { visibility: 'public' },
    pictures: { visibility: 'followers' },
    posts: { visibility: 'followers' },
    profileInfo: { visibility: 'public' },
  },
  groups: [],
};

const user2: User = {
  id: 'user-2',
  name: 'Elena',
  avatarUrl: 'https://i.pravatar.cc/150?img=25',
  bio: 'Musician, songwriter, and storyteller. Catch my live acoustic sessions here!',
  followers: [],
  following: [],
};

const user3: User = {
  id: 'user-3',
  name: 'Marcus',
  avatarUrl: 'https://i.pravatar.cc/150?img=32',
  bio: 'Filmmaker and VFX artist. Sharing behind-the-scenes and short films.',
  followers: [],
  following: [],
};

const user4: User = {
  id: 'user-4',
  name: 'Chloe',
  avatarUrl: 'https://i.pravatar.cc/150?img=45',
  bio: 'Photographer traveling the world. Currently in Tokyo. 🇯🇵',
  followers: [],
  following: [],
};

const user5: User = {
  id: 'user-5',
  name: 'Liam',
  avatarUrl: 'https://i.pravatar.cc/150?img=51',
  bio: 'Daily news and analysis on global events. Unpacking the headlines every morning.',
  followers: [],
  following: [],
};

// Establish relationships
user1.following = [user2, user3];
user1.followers = [user4, user5];

user2.followers = [user1];
user3.followers = [user1];

user4.following = [user1];
user5.following = [user1];

const closeFriendsGroup: Group = {
    id: 'group-1',
    name: 'Close Friends',
    members: [user2, user4]
};
user1.groups = [closeFriendsGroup];

export const MOCK_USERS: User[] = [user1, user2, user3, user4, user5];

// --- MOCK POSTS ---
const imagePostByChloe: Extract<DiscoverItem, { type: 'image_post' }> = {
  id: 'post-1',
  type: 'image_post',
  author: user4,
  imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=2072&auto=format&fit=crop',
  caption: 'Tokyo nights are something else. The energy is unreal!',
  likes: 1245,
  comments: [{ id: 'c1', user: user2, text: 'Stunning shot!', createdAt: new Date() }],
  createdAt: new Date(Date.now() - 3600 * 1000 * 2),
  tags: ['#photography', '#travel', '#tokyo'],
  status: 'published',
};

const videoPostByMarcus: Extract<DiscoverItem, { type: 'video_post' }> = {
  id: 'post-2',
  type: 'video_post',
  author: user3,
  videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
  caption: 'Working on some new VFX shots. What do you think of this fire simulation?',
  likes: 832,
  comments: [],
  createdAt: new Date(Date.now() - 3600 * 1000 * 5),
  tags: ['#vfx', '#filmmaking', '#cgi'],
  status: 'published',
};

const textPostByLiam: Extract<DiscoverItem, { type: 'text_post' }> = {
  id: 'post-3',
  type: 'text_post',
  author: user5,
  content: "Just finished today's morning brief. We covered the new trade agreements and their potential impact on the tech sector. The full recording is available in my profile. What are your thoughts?",
  likes: 349,
  comments: [{ id: 'c2', user: user1, text: 'Great analysis this morning!', createdAt: new Date() }],
  createdAt: new Date(Date.now() - 3600 * 1000 * 8),
  tags: ['#news', '#politics', '#tech'],
  status: 'published',
};

const voiceNotePostByElena: Extract<DiscoverItem, { type: 'voice_note_post' }> = {
    id: 'post-4',
    type: 'voice_note_post',
    author: user2,
    caption: 'A little melody idea that came to me this afternoon. 멜로디 아이디어 🎶',
    voiceMemo: { url: 'https://storage.googleapis.com/voice-memes/Eminem_My_Name_Is.mp3', duration: 12 },
    likes: 987,
    comments: [],
    createdAt: new Date(Date.now() - 3600 * 1000 * 12),
    tags: ['#music', '#songwriter', '#acoustic'],
};

// --- MOCK ROOMS ---
const room1: Room = {
  id: 'room-1',
  title: 'Weekly Acoustic Jam Session',
  description: 'Join me for some chill acoustic tunes. Request a song in the chat!',
  hosts: [user2],
  speakers: [],
  listeners: [user1, user3, user5],
  isPrivate: false,
  messages: [
    { id: 'msg-r1-1', user: user3, text: 'This sounds amazing, Elena!', createdAt: new Date(Date.now() - 1100 * 1000) },
    { id: 'msg-r1-2', user: user5, text: 'Can you play "Wonderwall"? 😉', createdAt: new Date(Date.now() - 1000 * 1000) },
    { id: 'msg-r1-3', user: user2, text: 'Haha, classic! Maybe later.', createdAt: new Date(Date.now() - 900 * 1000) },
    { id: 'msg-r1-4', user: user1, voiceMemo: { url: 'https://storage.googleapis.com/voice-memes/Eminem_My_Name_Is.mp3', duration: 8 }, createdAt: new Date(Date.now() - 800 * 1000) },
  ],
  createdAt: new Date(Date.now() - 1200 * 1000),
  isRecorded: true,
  isChatEnabled: true,
  isMicMuted: false,
};

const room2: Room = {
  id: 'room-2',
  title: 'Morning News Roundup',
  description: 'Discussing the top headlines of the day. All perspectives welcome.',
  hosts: [user5],
  speakers: [user1],
  listeners: [user2, user3, user4],
  isPrivate: false,
  isVideoEnabled: true,
  featuredUrl: 'https://www.reuters.com/',
  messages: [
    { id: 'msg-r2-1', user: user4, text: "What's the main takeaway from the new trade agreement?", createdAt: new Date(Date.now() - 500 * 1000) },
    { id: 'msg-r2-2', user: user5, text: "Good question, Chloe. The biggest thing is the focus on renewable energy tech. It's going to shift a lot of investment.", createdAt: new Date(Date.now() - 450 * 1000) },
    { id: 'msg-r2-3', user: user1, text: "I agree. I think we'll see a big push in solar and wind components from a few key players.", createdAt: new Date(Date.now() - 400 * 1000) },
  ],
  createdAt: new Date(Date.now() - 600 * 1000),
  isRecorded: false,
  isChatEnabled: true,
  isMicMuted: false,
};

const scheduledRoom: Room = {
    id: 'room-3',
    title: 'Tech Talks: The Future of AI',
    description: 'Special guest appearance to discuss the next wave of AI innovation.',
    hosts: [user1],
    speakers: [],
    listeners: [],
    isPrivate: true,
    isScheduled: true,
    scheduledTime: new Date(Date.now() + 3600 * 1000 * 24 * 2), // 2 days from now
    messages: [],
    isRecorded: true,
    isChatEnabled: true,
    isMicMuted: false,
};

export const MOCK_ROOMS: Room[] = [room1, room2, scheduledRoom];

// --- MOCK DISCOVER ITEMS ---
export const MOCK_DISCOVER_ITEMS: DiscoverItem[] = [
  { ...room1, type: 'live_room' },
  imagePostByChloe,
  { ...user2, type: 'user_profile' },
  { ...room2, type: 'live_room' },
  videoPostByMarcus,
  textPostByLiam,
  { ...user4, type: 'user_profile' },
  voiceNotePostByElena,
  { ...user5, type: 'user_profile' },
];

// --- MOCK CONVERSATIONS ---
export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'convo-1',
        participants: [user1, user4],
        messages: [
            { id: 'm1-1', user: user4, text: 'Hey! Loved your last Tech Talk.', createdAt: new Date(Date.now() - 3600 * 1000 * 48) },
            { id: 'm1-2', user: user1, text: 'Thanks Chloe! Appreciate you tuning in.', createdAt: new Date(Date.now() - 3600 * 1000 * 47) },
            { id: 'm1-3', user: user1, voiceMemo: { url: 'https://storage.googleapis.com/voice-memes/Eminem_My_Name_Is.mp3', duration: 8 }, createdAt: new Date(Date.now() - 3600 * 1000 * 47) },
        ]
    },
    {
        id: 'convo-2',
        participants: [user1, user3],
        messages: [
            { id: 'm2-1', user: user3, text: 'That video effect was sick. How did you do it?', createdAt: new Date(Date.now() - 3600 * 1000 * 3) }
        ]
    }
];

// --- MOCK NOTIFICATIONS ---
export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', text: 'Chloe (@chloe) started following you.', isRead: false, createdAt: new Date(Date.now() - 3600 * 1000) },
    { id: 'notif-2', text: 'Your scheduled room "Tech Talks: The Future of AI" starts in 2 hours.', isRead: false, createdAt: new Date(Date.now() - 3600 * 1000 * 2) },
    { id: 'notif-3', text: 'Marcus (@marcus) liked your comment on his post.', isRead: true, createdAt: new Date(Date.now() - 3600 * 1000 * 6) }
];


// --- MOCK CONTRIBUTION REQUESTS ---
export const MOCK_CONTRIBUTION_REQUESTS: ContributionRequest[] = [
    {
        id: 'req-1',
        fromUser: user4,
        toUser: user1,
        post: imagePostByChloe,
        status: 'pending',
        createdAt: new Date(Date.now() - 3600 * 1000 * 3),
    }
];
