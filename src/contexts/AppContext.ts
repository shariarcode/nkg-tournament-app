import React, { createContext } from 'react';
import { Player, Tournament, Registration, LeaderboardEntry, SiteContent } from '../types';
import { Session } from '@supabase/supabase-js';

export type View = 'home' | 'tournaments' | 'profile' | 'leaderboard' | 'tournamentDetails' | 'live' | 'squadRegistration';

export interface AppContextType {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  isAnonymous: boolean;
  isAdmin: boolean;
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
  siteContent: SiteContent;
  setSiteContent: React.Dispatch<React.SetStateAction<SiteContent>>;
}

export const AppContext = createContext<AppContextType | null>(null);
