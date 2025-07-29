import React, { useContext } from 'react';
import { View, AppContext, AppContextType } from '../contexts/AppContext';
import { UserIcon, TrophyIcon, HomeIcon, ChartBarIcon, WrenchScrewdriverIcon, ArrowRightOnRectangleIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isAdminView: boolean;
  onSetIsAdminView: React.Dispatch<React.SetStateAction<boolean>>;
  isUserAdmin: boolean;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-red-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdminView, onSetIsAdminView, isUserAdmin }) => {
  const { player, signOut } = useContext(AppContext) as AppContextType;

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-white tracking-wider">NKG <span className="text-red-500">Tournament</span></span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            {!isAdminView && (
              <>
                <NavItem label="Home" icon={<HomeIcon className="h-5 w-5" />} isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
                <NavItem label="Tournaments" icon={<TrophyIcon className="h-5 w-5" />} isActive={currentView === 'tournaments'} onClick={() => onNavigate('tournaments')} />
                <NavItem label="Leaderboard" icon={<ChartBarIcon className="h-5 w-5" />} isActive={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
                <NavItem label="Profile" icon={<UserIcon className="h-5 w-5" />} isActive={currentView === 'profile'} onClick={() => onNavigate('profile')} />
              </>
            )}
             {isAdminView && (
               <div className="flex items-center space-x-2 text-yellow-400">
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                  <span className="font-semibold">Admin Panel</span>
                </div>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
               <img src={player.profilePicUrl} alt="Player" className="h-8 w-8 rounded-full border-2 border-red-500 object-cover"/>
               <span className="hidden sm:inline text-sm font-medium text-gray-300">{player.name}</span>
            </div>
            {isUserAdmin && (
              <label htmlFor="admin-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="admin-toggle" className="sr-only" checked={isAdminView} onChange={(e) => onSetIsAdminView(e.target.checked)} />
                  <div className={`block w-14 h-8 rounded-full transition ${isAdminView ? 'bg-red-600' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${isAdminView ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-300 text-sm font-medium hidden lg:block">Admin</div>
              </label>
            )}
             <button onClick={signOut} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white" aria-label="Sign Out">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {!isAdminView && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="flex justify-around py-2">
            <NavItem label="Home" icon={<HomeIcon className="h-6 w-6" />} isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
            <NavItem label="Tournaments" icon={<TrophyIcon className="h-6 w-6" />} isActive={currentView === 'tournaments'} onClick={() => onNavigate('tournaments')} />
            <NavItem label="Leaderboard" icon={<ChartBarIcon className="h-6 w-6" />} isActive={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
            <NavItem label="Profile" icon={<UserIcon className="h-6 w-6" />} isActive={currentView === 'profile'} onClick={() => onNavigate('profile')} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;