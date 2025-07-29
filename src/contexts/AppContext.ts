import React, { createContext } from 'react';
import { Player, Tournament, Registration, LeaderboardEntry } from '../types';
import { Session } from '@supabase/supabase-js';

export type View = 'home' | 'tournaments' | 'profile' | 'leaderboard' | 'tournamentDetails';

export interface AppContextType {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  isAnonymous: boolean;
  isAdmin: boolean;
  notice: string;
  setNotice: React.Dispatch<React.SetStateAction<string>>;
  isAdminView: boolean;
  navigate: (view: View) => void;
  navigateToTournamentDetails: (tournament: Tournament) => void;
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  leaderboard: LeaderboardEntry[];
  setLeaderboard: React.Dispatch<React.SetStateAction<LeaderboardEntry[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  signOut: () => void;
  session: Session | null;
}

export const AppContext = createContext<AppContextType | null>(null);
