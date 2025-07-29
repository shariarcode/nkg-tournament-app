import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppContext, AppContextType, View } from './contexts/AppContext';
import { Player, Tournament, Registration, LeaderboardEntry, SupabaseProfile } from './types';
import { MOCK_TOURNAMENTS, MOCK_LEADERBOARD, ANONYMOUS_PLAYER } from './constants';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

import Header from './components/Header';
import Home from './views/Home';
import Tournaments from './views/Tournaments';
import Profile from './views/Profile';
import Leaderboard from './views/Leaderboard';
import AdminDashboard from './views/AdminDashboard';
import AIChat from './components/AIChat';
import WhatsAppButton from './components/WhatsAppButton';
import Auth from './views/Auth';
import TournamentDetails from './views/TournamentDetails';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player>(ANONYMOUS_PLAYER);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [notice, setNotice] = useState('🏆 Grand Opening Tournament! Join now for a chance to win 10,000 BDT! 🏆');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedTournamentForDetails, setSelectedTournamentForDetails] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: tourneyData, error: tourneyError } = await supabase.from('tournaments').select('*').order('date', { ascending: false });
        if (tourneyError) throw tourneyError;
        setTournaments(tourneyData || []);

        const { data: leaderboardData, error: leaderboardError } = await supabase.from('leaderboard').select('*').order('rank', { ascending: true });
        if (leaderboardError) throw leaderboardError;
        setLeaderboard(leaderboardData || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Set mock data as fallback
        setTournaments(MOCK_TOURNAMENTS);
        setLeaderboard(MOCK_LEADERBOARD);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserAndRegistrations = async () => {
      if (session?.user) {
        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          handleSignOut();
        } else if (profile) {
          setPlayer({
            id: profile.id,
            name: profile.name || 'New Player',
            email: session.user.email || '',
            freeFireId: profile.free_fire_id || 'N/A',
            phone: profile.phone || 'N/A',
            profilePicUrl: profile.profile_pic_url || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${profile.id}`,
            isAnonymous: false,
            isAdmin: profile.is_admin || false,
          });
          
          // Fetch user-specific registrations
          const { data: regData, error: regError } = await supabase
            .from('registrations')
            .select('*, tournaments(name)')
            .eq('player_id', session.user.id);

          if (regError) console.error("Error fetching registrations", regError);
          else setRegistrations(regData?.map(r => ({...r, tournamentName: (r.tournaments as any)?.name || 'N/A'} as Registration)) || []);
        }
      } else {
        setPlayer(ANONYMOUS_PLAYER);
        setRegistrations([]);
      }
    };

    fetchUserAndRegistrations();
  }, [session]);
  
  // Realtime listener for registrations (for admins)
  useEffect(() => {
    if (player.isAdmin) {
      const channel = supabase
        .channel('public:registrations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          async (payload) => {
             console.log('Reg change received!', payload);
             // Simple refetch for now
             const { data, error } = await supabase.from('registrations').select('*, profiles(name), tournaments(name)');
             if (error) console.error(error);
             else setRegistrations(data?.map(r => ({...r, playerName: (r.profiles as any)?.name, tournamentName: (r.tournaments as any)?.name })) || []);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [player.isAdmin]);

  const navigate = useCallback((view: View) => {
    setCurrentView(view);
    if (view !== 'tournamentDetails') {
      setSelectedTournamentForDetails(null);
    }
  }, []);

  const navigateToTournamentDetails = useCallback((tournament: Tournament) => {
    setSelectedTournamentForDetails(tournament);
    setCurrentView('tournamentDetails');
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setPlayer(ANONYMOUS_PLAYER);
    setCurrentView('home');
    setIsAdminView(false);
    setSession(null);
  }, []);

  const contextValue: AppContextType = useMemo(() => ({
    player,
    setPlayer,
    isAnonymous: !!player.isAnonymous,
    isAdmin: !!player.isAdmin,
    notice,
    setNotice,
    isAdminView,
    navigate,
    navigateToTournamentDetails,
    tournaments,
    setTournaments,
    leaderboard,
    setLeaderboard,
    registrations,
    setRegistrations,
    signOut: handleSignOut,
    session,
  }), [player, notice, isAdminView, navigate, tournaments, leaderboard, registrations, handleSignOut, navigateToTournamentDetails, session]);
  
  const renderView = () => {
    if (loading) {
       return <div className="text-center p-10">Loading...</div>;
    }
    if (isAdminView && player.isAdmin) return <AdminDashboard />;
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'tournaments':
        return <Tournaments />;
      case 'profile':
        return <Profile />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'tournamentDetails':
        return selectedTournamentForDetails ? <TournamentDetails tournament={selectedTournamentForDetails} /> : <Tournaments />;
      default:
        return <Home />;
    }
  };
  
  if (!session && !player.isAnonymous) {
     return <Auth />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Header currentView={currentView} onNavigate={navigate} isAdminView={isAdminView} onSetIsAdminView={setIsAdminView} isUserAdmin={!!player.isAdmin} />
        <main className="container mx-auto px-4 py-8">
          {renderView()}
        </main>
        <AIChat />
        <WhatsAppButton />
      </div>
    </AppContext.Provider>
  );
}
