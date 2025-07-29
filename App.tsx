
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppContext, AppContextType, View } from './contexts/AppContext';
import { Player, Tournament, Registration, LeaderboardEntry } from './types';
import { MOCK_TOURNAMENTS, MOCK_LEADERBOARD, ADMIN_EMAILS, INITIAL_PLAYER_STATE, ANONYMOUS_PLAYER } from './constants';
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

const USERS_STORAGE_KEY = 'nkg_users';
const REGISTRATIONS_STORAGE_KEY = 'nkg_registrations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [notice, setNotice] = useState('🏆 Grand Opening Tournament! Join now for a chance to win 10,000 BDT! 🏆');
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER_STATE);
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [recoveryInfo, setRecoveryInfo] = useState<{email: string; code: string} | null>(null);
  const [selectedTournamentForDetails, setSelectedTournamentForDetails] = useState<Tournament | null>(null);

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const savedRegistrations = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
      return savedRegistrations ? JSON.parse(savedRegistrations) : [];
    } catch (error) {
      console.error("Failed to parse registrations from localStorage", error);
      return [];
    }
  });

  // Seed all admin users on first load if they don't exist
  useEffect(() => {
    const savedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    let users: Player[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    let usersModified = false;

    ADMIN_EMAILS.forEach(adminEmail => {
        const adminExists = users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase());
        if (!adminExists) {
            const newAdmin: Player = {
                id: `admin_${Date.now()}_${Math.random()}`,
                name: `Admin (${adminEmail.split('@')[0]})`,
                email: adminEmail,
                password: 'adminpassword', // Default password for all seeded admins
                freeFireId: '123456789',
                phone: '01700000000',
                profilePicUrl: `https://picsum.photos/seed/${adminEmail}/200`
            };
            users.push(newAdmin);
            usersModified = true;
        }
    });

    if (usersModified) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, []);

  // Persist player profile updates to localStorage
  useEffect(() => {
    if (player.id && !player.isAnonymous) {
        const savedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
        let users: Player[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const userIndex = users.findIndex(u => u.id === player.id);
        if (userIndex > -1) {
            users[userIndex] = player;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
    }
  }, [player]);


  useEffect(() => {
    try {
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
    } catch (error) {
      console.error("Failed to save registrations to localStorage", error);
    }
  }, [registrations]);


  const isUserAdmin = useMemo(() => !player.isAnonymous && ADMIN_EMAILS.includes(player.email.toLowerCase()), [player.email, player.isAnonymous]);

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

  const addRegistration = useCallback((registration: Registration) => {
    setRegistrations(prev => [...prev, registration]);
    alert('Thank you for your submission! Please wait for admin approval.');
  }, []);

  const approveRegistration = useCallback((registrationId: string) => {
    setRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId ? { ...reg, status: 'Approved' } : reg
      )
    );
  }, []);

  const addTournament = useCallback((tournament: Omit<Tournament, 'id'>) => {
    const newTournament: Tournament = {
      ...tournament,
      id: `tourney_${Date.now()}`,
    };
    setTournaments(prev => [newTournament, ...prev]);
  }, []);

  const editTournament = useCallback((updatedTournament: Tournament) => {
    setTournaments(prev =>
      prev.map(t => (t.id === updatedTournament.id ? updatedTournament : t))
    );
  }, []);

  const handleSignIn = useCallback((email: string, pass: string) => {
    const users: Player[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.password === pass) {
      setPlayer(foundUser);
      setIsAuthenticated(true);
    } else {
      alert("Invalid email or password. Please sign up & try again.");
    }
  }, []);

  const handleSignUp = useCallback((name: string, email: string, pass: string) => {
    let users: Player[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      alert("An account with this email already exists. Please sign in.");
      return;
    }

    const newUser: Player = {
      id: `player_${Date.now()}`,
      name,
      email,
      password: pass,
      freeFireId: '000000000',
      phone: 'N/A',
      profilePicUrl: `https://picsum.photos/seed/${email}/200`,
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    setPlayer(newUser);
    setIsAuthenticated(true);
  }, []);
  
  const handleAnonymousSignIn = useCallback(() => {
     setPlayer(ANONYMOUS_PLAYER);
     setIsAuthenticated(true);
  }, []);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    setPlayer(INITIAL_PLAYER_STATE); 
    setCurrentView('home');
    setIsAdminView(false);
  }, []);
  
  const handleRequestRecoveryCode = useCallback((email: string) => {
    const users: Player[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    // This is a simulation. In a real app, you would have a backend service to send emails.
    // To make this feature testable without a backend, we will display the code in an alert.
    if (userExists) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      setRecoveryInfo({ email, code });
      
      // Log to console for developers
      console.log(`Password recovery code for ${email}: ${code}`);

      // Show alert to the user for testing purposes
      alert(`This is a demo. An email can't be sent.\n\nYour verification code is: ${code}\n\nPlease enter this on the next screen.`);
    } else {
        // For security, always show a generic message if the user does not exist.
        // This prevents attackers from discovering registered email addresses.
        alert("If an account with that email exists, a verification code has been sent.");
    }
  }, []);


  const handleVerifyRecoveryCode = useCallback((code: string): boolean => {
    if (recoveryInfo && recoveryInfo.code === code) {
      return true;
    }
    alert("Invalid verification code.");
    return false;
  }, [recoveryInfo]);

  const handleResetPassword = useCallback((newPassword: string) => {
    if (!recoveryInfo) {
      alert("Something went wrong. Please start the recovery process again.");
      return;
    }

    let users: Player[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === recoveryInfo.email.toLowerCase());

    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], password: newPassword };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      alert("Password has been reset successfully. You can now sign in.");
    } else {
      alert("Could not find user account. Please try again.");
    }
    setRecoveryInfo(null);
  }, [recoveryInfo]);

  const contextValue: AppContextType = useMemo(() => ({
    player,
    setPlayer,
    isAnonymous: player.isAnonymous || false,
    notice,
    setNotice,
    isAdminView,
    navigate,
    navigateToTournamentDetails,
    tournaments,
    addTournament,
    editTournament,
    leaderboard,
    setLeaderboard,
    registrations,
    addRegistration,
    approveRegistration,
    signOut: handleSignOut,
  }), [player, notice, isAdminView, navigate, tournaments, leaderboard, setLeaderboard, registrations, addRegistration, approveRegistration, addTournament, editTournament, handleSignOut, navigateToTournamentDetails]);

  const renderView = () => {
    if (isAdminView && isUserAdmin) return <AdminDashboard />;
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
  
  if (!isAuthenticated) {
    return (
      <Auth 
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onAnonymousSignIn={handleAnonymousSignIn}
        onRequestRecoveryCode={handleRequestRecoveryCode}
        onVerifyRecoveryCode={handleVerifyRecoveryCode}
        onResetPassword={handleResetPassword}
      />
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Header currentView={currentView} onNavigate={navigate} isAdminView={isAdminView} onSetIsAdminView={setIsAdminView} isUserAdmin={isUserAdmin} />
        <main className="container mx-auto px-4 py-8">
          {renderView()}
        </main>
        <AIChat />
        <WhatsAppButton />
      </div>
    </AppContext.Provider>
  );
}