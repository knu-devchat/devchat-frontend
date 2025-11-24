import { useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
}
