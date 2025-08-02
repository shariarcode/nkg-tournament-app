

import { useState, useCallback, useMemo, useEffect } from 'react';
import { AppContext, AppContextType, View } from './contexts/AppContext';
import { Player, Tournament, Registration, LeaderboardEntry, SupabaseProfile, SiteContent, SiteContentEntry } from './types';
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
import Auth from './views/Auth';
import TournamentDetails from './views/TournamentDetails';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player>(ANONYMOUS_PLAYER);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedTournamentForDetails, setSelectedTournamentForDetails] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const tourneyPromise = supabase.from('tournaments').select('*').order('date', { ascending: false });
        const leaderboardPromise = supabase.from('leaderboard').select('*').order('rank', { ascending: true });
        const contentPromise = supabase.from('site_content').select('*');

        const [tourneyResult, leaderboardResult, contentResult] = await Promise.all([tourneyPromise, leaderboardPromise, contentPromise]);

        const { data: tourneyData, error: tourneyError } = tourneyResult;
        if (tourneyError) throw tourneyError;
        setTournaments((tourneyData as Tournament[]) || []);

        const { data: leaderboardData, error: leaderboardError } = leaderboardResult;
        if (leaderboardError) throw leaderboardError;
        setLeaderboard((leaderboardData as LeaderboardEntry[]) || []);
        
        const { data: contentData, error: contentError } = contentResult;
        if (contentError) {
          console.error("Error fetching site content:", contentError);
        } else if (contentData) {
          const contentMap = (contentData as SiteContentEntry[]).reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as SiteContent);
          setSiteContent(contentMap);
        }

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
        setLoading(true);
        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          await handleSignOut();
        } else if (profile) {
          const typedProfile = profile as SupabaseProfile;
          const fetchedPlayer: Player = {
            id: typedProfile.id,
            name: typedProfile.name || 'New Player',
            email: session.user.email || '',
            freeFireId: typedProfile.free_fire_id || 'N/A',
            phone: typedProfile.phone || 'N/A',
            profilePicUrl: typedProfile.profile_pic_url || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${typedProfile.id}`,
            isAnonymous: false,
            isAdmin: typedProfile.is_admin || false,
          };
          setPlayer(fetchedPlayer);
          
          // Fetch user-specific registrations
          const { data: regData, error: regError } = await supabase
            .from('registrations')
            .select('*, tournaments(name)')
            .eq('player_id', session.user.id);

          if (regError) {
            console.error("Error fetching registrations", regError);
          } else if (regData) {
            const formattedRegs: Registration[] = (regData as any[]).map(reg => ({
                ...reg,
                tournamentName: reg.tournaments?.name || 'N/A'
            }));
            setRegistrations(formattedRegs);
          }
        }
        setLoading(false);
      } else {
        setPlayer(ANONYMOUS_PLAYER);
        setRegistrations([]);
        setLoading(false);
      }
    };

    fetchUserAndRegistrations();
  }, [session]);
  

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
    siteContent,
    setSiteContent,
  }), [player, isAdminView, navigate, tournaments, leaderboard, registrations, handleSignOut, navigateToTournamentDetails, session, siteContent]);
  
  const renderView = () => {
    if (loading) {
       return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-green"></div></div>;
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
  
  if (!session && !loading) {
     return <Auth />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-dark-1 text-light-1 font-sans">
        <Header currentView={currentView} onNavigate={navigate} isAdminView={isAdminView} onSetIsAdminView={setIsAdminView} isUserAdmin={!!player.isAdmin} />
        <main className="container mx-auto px-4 py-8 md:py-16">
          {renderView()}
        </main>
        <AIChat />
      </div>
    </AppContext.Provider>
  );
}