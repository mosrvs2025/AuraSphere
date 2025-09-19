// Implemented UserContext to provide current user data throughout the application.
import { createContext } from 'react';
import { User } from '../types';

export interface IUserContext {
  currentUser: User;
  updateCurrentUser: (userData: Partial<User>) => void;
  getUserById: (id: string) => User | undefined;
}

// This dummy user will be replaced by the state in App.tsx
const dummyUser: User = {
  id: 'user-0',
  name: 'Default User',
  avatarUrl: 'https://i.pravatar.cc/150?img=1',
  followers: [],
  following: []
};

export const UserContext = createContext<IUserContext>({
  currentUser: dummyUser,
  updateCurrentUser: () => console.warn('updateCurrentUser called outside of a UserContext.Provider'),
  getUserById: () => {
    console.warn('getUserById called outside of a UserContext.Provider');
    return undefined;
  },
});
