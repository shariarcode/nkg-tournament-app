import { Database } from './services/database.types';

// Profile type based on Supabase table
export type SupabaseProfile = Database['public']['Tables']['profiles']['Row'];

export interface Player {
  id: string; // Corresponds to Supabase auth.users.id (UUID)
  name: string;
  email: string;
  freeFireId: string;
  phone: string;
  profilePicUrl: string;
  isAnonymous?: boolean;
  isAdmin?: boolean;
}

// Tournament type based on Supabase table
export type Tournament = Database['public']['Tables']['tournaments']['Row'];

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

// Registration type based on Supabase table
// We add player/tournament names for easier display
export type Registration = Database['public']['Tables']['registrations']['Row'] & {
    playerName?: string;
    playerFreeFireId?: string; // This can be joined from profiles table
    tournamentName?: string;
};


// Leaderboard entry type based on Supabase table
export type LeaderboardEntry = Database['public']['Tables']['leaderboard']['Row'];


export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}