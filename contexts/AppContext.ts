
import React, { createContext } from 'react';
import { Player, Tournament, Registration, LeaderboardEntry } from '../types';

export type View = 'home' | 'tournaments' | 'profile' | 'leaderboard' | 'tournamentDetails';

export interface AppContextType {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  isAnonymous: boolean;
  notice: string;
  setNotice: React.Dispatch<React.SetStateAction<string>>;
  isAdminView: boolean;
  navigate: (view: View) => void;
  navigateToTournamentDetails: (tournament: Tournament) => void;
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id'>) => void;
  editTournament: (tournament: Tournament) => void;
  leaderboard: LeaderboardEntry[];
  setLeaderboard: React.Dispatch<React.SetStateAction<LeaderboardEntry[]>>;
  registrations: Registration[];
  addRegistration: (registration: Registration) => void;
  approveRegistration: (registrationId: string) => void;
  signOut: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);