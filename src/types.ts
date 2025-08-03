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

// Base registration type from the database schema
export type DbRegistration = Database['public']['Tables']['registrations']['Row'];

// This is the type we'll use in the app state, which includes flattened data from joins.
export interface Registration extends DbRegistration {
    playerName?: string;
    playerFreeFireId?: string;
    tournamentName?: string;
}

// Squad type based on new squads table
export type Squad = Database['public']['Tables']['squads']['Row'];


// Leaderboard entry type based on Supabase table
export type LeaderboardEntry = Database['public']['Tables']['leaderboard']['Row'];


export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}

export interface Game {
  id: number;
  title: string;
  imageUrl: string;
  entryFee: string;
}

// Types for sitewide editable content
export type SiteContentEntry = Database['public']['Tables']['site_content']['Row'];
export type SiteContent = Record<string, string>;
