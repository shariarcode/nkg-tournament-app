
export interface Player {
  id: string;
  name: string;
  email: string;
  freeFireId: string;
  phone: string;
  profilePicUrl: string;
  password?: string;
  isAnonymous?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  entryFee: number;
  prizePool: number;
  status: 'Upcoming' | 'Ongoing' | 'Finished';
  roomId?: string;
  roomPassword?: string;
}

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Registration {
  id: string;
  playerId: string;
  playerName: string;
  playerFreeFireId: string;
  tournamentId: string;
  tournamentName: string;
  bkashNumber: string;
  bkashLast4: string;
  paymentScreenshotUrl: string;
  status: RegistrationStatus;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  winnings: number;
  profilePicUrl:string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}