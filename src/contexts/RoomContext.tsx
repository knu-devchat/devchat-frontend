import { createContext, useState, type ReactNode } from 'react';

interface Room {
  room_uuid: string;
  room_name: string;
  description?: string;
  admin: string;
  participant_count: number;
  participants?: any[];
  can_generate_totp?: boolean;
  created_at: string;
  updated_at?: string;
  user_role: string;
}

interface RoomContextType {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode; }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <RoomContext.Provider value={{ selectedRoom, setSelectedRoom }}>
      {children}
    </RoomContext.Provider>
  );
}
