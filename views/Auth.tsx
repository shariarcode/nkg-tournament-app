
import React, { useState } from 'react';
import { GoogleIcon, TrophyIcon } from '../components/Icons';

interface AuthProps {
  onSignIn: (email: string, pass: string) => void;
  onSignUp: (name: string, email: string, pass: string) => void;
  onAnonymousSignIn: () => void;
  onRequestRecoveryCode: (email: string) => void;
  onVerifyRecoveryCode: (code: string) => boolean;
  onResetPassword: (newPassword: string) => void;
}

type AuthMode = 'signIn' | 'signUp' | 'recover';
type RecoveryStep = 'enterEmail' | 'enterCode' | 'setNewPassword';

const Auth: React.FC<AuthProps> = ({ 
    onSignIn, 
    onSignUp, 
    onAnonymousSignIn,
    onRequestRecoveryCode,
    onVerifyRecoveryCode,
    onResetPassword
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('enterEmail');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const resetAllFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setRecoveryStep('enterEmail'); // Always reset recovery flow
    resetAllFields();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signUp') {
      if (!name) {
        alert("Please enter your name.");
        return;
      }
      onSignUp(name, email, password);
    } else { // signIn
      onSignIn(email, password);
    }
  };
  
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryStep === 'enterEmail') {
      if (!email) {
          alert("Please enter your email address.");
          return;
      }
      onRequestRecoveryCode(email);
      setRecoveryStep('enterCode'); // Always proceed to next step for security
    } else if (recoveryStep === 'enterCode') {
        if (!verificationCode) {
            alert("Please enter the verification code.");
            return;
        }
        if (onVerifyRecoveryCode(verificationCode)) {
            setRecoveryStep('setNewPassword');
        }
    } else if (recoveryStep === 'setNewPassword') {
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match.");
            return;
        }
        onResetPassword(newPassword);
        handleSwitchMode('signIn'); // Go back to sign-in on success
    }
  };

  const getPageTitle = () => {
      if (authMode === 'recover') {
          if (recoveryStep === 'enterCode') return 'Enter Verification Code';
          if (recoveryStep === 'setNewPassword') return 'Set a New Password';
          return 'Recover Your Account';
      }
      if (authMode === 'signUp') return "Create your account to start competing";
      return "Sign in to join the battle";
  }

  const renderRecoveryForm = () => (
    <form onSubmit={handleRecoverySubmit} className="space-y-6">
      {recoveryStep === 'enterEmail' && (
        <div>
          <label htmlFor="email-recover" className="text-sm font-medium text-gray-300 sr-only">Email address</label>
          <input
              id="email-recover"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email address"
          />
        </div>
      )}

      {recoveryStep === 'enterCode' && (
        <div>
          <label htmlFor="code" className="text-sm font-medium text-gray-300 sr-only">Verification Code</label>
          <input
              id="code"
              type="text"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="6-digit code"
          />
        </div>
      )}

      {recoveryStep === 'setNewPassword' && (
        <>
          <div>
            <label htmlFor="new-password" className="text-sm font-medium text-gray-300 sr-only">New Password</label>
            <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="New Password"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="text-sm font-medium text-gray-300 sr-only">Confirm New Password</label>
            <input
                id="confirm-new-password"
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Confirm New Password"
            />
          </div>
        </>
      )}

       <button
          type="submit"
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
          {recoveryStep === 'enterEmail' && 'Send Verification Code'}
          {recoveryStep === 'enterCode' && 'Verify Code'}
          {recoveryStep === 'setNewPassword' && 'Reset Password'}
      </button>
    </form>
  );

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
            {authMode === 'recover' ? renderRecoveryForm() : (
             <>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {authMode === 'signUp' && (
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-gray-300 sr-only">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Your Name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-300 sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-300 sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={authMode === 'signUp' ? "new-password" : "current-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Password"
                        />
                    </div>
                    
                    {authMode === 'signIn' && (
                       <div className="text-right -mt-2">
                           <button type="button" onClick={() => handleSwitchMode('recover')} className="text-sm font-medium text-red-500 hover:text-red-400">
                               Forgot password?
                           </button>
                       </div>
                    )}
                    
                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                        {authMode === 'signUp' ? 'Create Account' : 'Sign In'}
                    </button>
                </form>
            </>
            )}
            
            <p className="mt-6 text-center text-sm text-gray-400">
                {authMode === 'recover' ? 'Remembered your password?' : authMode === 'signUp' ? 'Already have an account?' : "Don't have an account?"}
                <button 
                    onClick={() => handleSwitchMode(authMode === 'signIn' || authMode === 'recover' ? 'signUp' : 'signIn')} 
                    className="font-medium text-red-500 hover:text-red-400 ml-1"
                >
                    {authMode === 'signIn' || authMode === 'recover' ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
             <p className="mt-4 text-center text-sm text-gray-500">
                or{' '}
                <button 
                    onClick={onAnonymousSignIn}
                    className="font-medium text-red-500 hover:text-red-400 underline"
                >
                    Continue as a Guest
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;