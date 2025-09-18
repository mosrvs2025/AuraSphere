import { createContext } from 'react';

export interface IRoomActionsContext {
  isSharingScreen: boolean;
  onToggleScreenShare: () => Promise<void>;
}

const defaultToggleScreenShare = async () => {
  console.warn('onToggleScreenShare function was called without a Provider.');
};

export const RoomActionsContext = createContext<IRoomActionsContext>({
  isSharingScreen: false,
  onToggleScreenShare: defaultToggleScreenShare,
});
