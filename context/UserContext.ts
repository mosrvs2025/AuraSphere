import { createContext } from 'react';
import { User } from '../types';
import { MOCK_USER_LISTENER } from '../constants';

export interface IUserContext {
  currentUser: User;
  updateUserAvatar: (newAvatarUrl: string, isGenerated?: boolean) => void;
}

const defaultUpdateUserAvatar = () => console.warn('updateUserAvatar function was called without a Provider.');

export const UserContext = createContext<IUserContext>({
  currentUser: MOCK_USER_LISTENER,
  updateUserAvatar: defaultUpdateUserAvatar,
});