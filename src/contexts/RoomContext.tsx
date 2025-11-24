import { createContext, useState, type ReactNode } from 'react';

export interface Room {
  roomName: string;
  subject: string;
  date: string;
}

interface RoomContextType {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <RoomContext.Provider value={{ selectedRoom, setSelectedRoom }}>
      {children}
    </RoomContext.Provider>
  );
}
