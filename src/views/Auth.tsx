import React, { useState, useContext } from 'react';
import { supabase } from '../services/supabase';
import { ANONYMOUS_PLAYER } from '../constants';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { TrophyIcon } from '../components/Icons';

type AuthMode = 'signIn' | 'signUp' | 'recover';
type RecoveryStep = 'enterEmail' | 'setNewPassword';

const Auth: React.FC = () => {
  const { setPlayer } = useContext(AppContext) as AppContextType;
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('enterEmail');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetAllFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setRecoveryStep('enterEmail');
    resetAllFields();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });
    if (error) setError(error.message);
    else setMessage("Success! Please check your email for a verification link.");
    setLoading(false);
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirect back to your app
    });
    if (error) setError(error.message);
    else setMessage("Password recovery link sent! Please check your email.");
    setLoading(false);
  }

  const handleAnonymousSignIn = () => {
    setPlayer(ANONYMOUS_PLAYER);
  };

  const getPageTitle = () => {
      if (authMode === 'recover') return 'Recover Your Account';
      if (authMode === 'signUp') return "Create your account to start competing";
      return "Sign in to join the battle";
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <TrophyIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-4xl font-extrabold text-white mt-2">
                NKG <span className="text-red-500">Tournament</span>
            </h1>
            <p className="text-gray-400 mt-2">{getPageTitle()}</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
            {error && <p className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
            {message && <p className="bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-md mb-4 text-center">{message}</p>}
            
            {authMode === 'recover' ? (
                 <form onSubmit={handlePasswordRecovery} className="space-y-6">
                    <input id="email-recover" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Enter your email address" />
                    <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-500">
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                 </form>
            ) : (
                <form onSubmit={authMode === 'signIn' ? handleSignIn : handleSignUp} className="space-y-6">
                    {authMode === 'signUp' && (
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Your Name" />
                    )}
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Email address" />
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Password" />
                    
                    {authMode === 'signIn' && (
                       <div className="text-right -mt-2">
                           <button type="button" onClick={() => handleSwitchMode('recover')} className="text-sm font-medium text-red-500 hover:text-red-400">
                               Forgot password?
                           </button>
                       </div>
                    )}
                    
                    <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-500">
                        {loading ? 'Processing...' : (authMode === 'signUp' ? 'Create Account' : 'Sign In')}
                    </button>
                </form>
            )}
            
            <p className="mt-6 text-center text-sm text-gray-400">
                {authMode === 'recover' ? 'Remembered your password?' : authMode === 'signUp' ? 'Already have an account?' : "Don't have an account?"}
                <button onClick={() => handleSwitchMode(authMode === 'signIn' || authMode === 'recover' ? 'signUp' : 'signIn')} className="font-medium text-red-500 hover:text-red-400 ml-1">
                    {authMode === 'signIn' || authMode === 'recover' ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
                or{' '}
                <button onClick={handleAnonymousSignIn} className="font-medium text-red-500 hover:text-red-400 underline">
                    Continue as a Guest
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
