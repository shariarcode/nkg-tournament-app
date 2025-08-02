
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { GoogleIcon } from '../components/Icons';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp' | 'recover' | 'updatePassword'>('signIn');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const REDIRECT_URL = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (event === 'PASSWORD_RECOVERY') {
          setAuthMode('updatePassword');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);


  const resetAllFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };

  const handleSwitchMode = (mode: 'signIn' | 'signUp' | 'recover') => {
    setAuthMode(mode);
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
        emailRedirectTo: REDIRECT_URL,
        data: {
          name: name,
          profile_pic_url: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${email}`
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
    // on success, the main onAuthStateChange listener in App.tsx will handle the navigation
    setLoading(false);
  }

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: REDIRECT_URL },
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: REDIRECT_URL,
    });
    if (error) setError(error.message);
    else setMessage("Password recovery link sent! Please check your email.");
    setLoading(false);
  }
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      if(password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setLoading(false);
          return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else {
          setMessage("Password updated successfully! You can now sign in.");
          setAuthMode('signIn');
      }
      setLoading(false);
  };

  const getPageTitle = () => {
      if (authMode === 'recover') return 'Recover Your Account';
      if (authMode === 'signUp') return "Create Your Account to Start Competing";
      if (authMode === 'updatePassword') return "Create a New Password";
      return "Sign in to Join the Battle";
  }

  return (
    <div className="min-h-screen bg-dark-1 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <img src="/favicon.svg" alt="NKG Logo" className="h-16 w-16 mx-auto"/>
            <h1 className="text-5xl font-display text-white mt-4">NKG</h1>
            <p className="text-light-2 mt-2 font-sans">{getPageTitle()}</p>
        </div>
        
        <div className="bg-dark-2 border border-white/10 rounded-xl shadow-2xl p-8">
            {error && <p className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md mb-4 text-center text-sm font-sans">{error}</p>}
            {message && <p className="bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-md mb-4 text-center text-sm font-sans">{message}</p>}
            
            {authMode === 'updatePassword' ? (
                 <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Enter your new password" />
                    <button type="submit" disabled={loading} className="w-full btn btn-primary">
                        {loading ? 'Saving...' : 'Save New Password'}
                    </button>
                 </form>
            ) : authMode === 'recover' ? (
                 <form onSubmit={handlePasswordRecovery} className="space-y-6">
                    <input id="email-recover" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Enter your email address" />
                    <button type="submit" disabled={loading} className="w-full btn btn-primary">
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                 </form>
            ) : (
                <>
                    <form onSubmit={authMode === 'signIn' ? handleSignIn : handleSignUp} className="space-y-6">
                        {authMode === 'signUp' && (
                            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your Name" />
                        )}
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Email address" />
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Password (at least 6 characters)" />
                        
                        {authMode === 'signIn' && (
                           <div className="text-right -mt-4">
                               <button type="button" onClick={() => handleSwitchMode('recover')} className="text-sm font-medium text-brand-green hover:underline font-sans">
                                   Forgot password?
                               </button>
                           </div>
                        )}
                        
                        <button type="submit" disabled={loading} className="w-full btn btn-primary">
                            {loading ? 'Processing...' : (authMode === 'signUp' ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="flex-shrink mx-4 text-light-2 text-xs uppercase font-sans">Or</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleSignInWithGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-light-1 text-dark-1 font-bold py-3 rounded-lg transition-colors hover:bg-gray-200 disabled:bg-gray-400 btn"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Sign in with Google
                    </button>
                </>
            )}
            
             {authMode !== 'updatePassword' && (
                <p className="mt-6 text-center text-sm text-light-2 font-sans">
                    {authMode === 'recover' ? 'Remembered your password?' : authMode === 'signUp' ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => handleSwitchMode(authMode === 'signIn' || authMode === 'recover' ? 'signUp' : 'signIn')} className="font-medium text-brand-green hover:underline ml-1">
                        {authMode === 'signIn' || authMode === 'recover' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;