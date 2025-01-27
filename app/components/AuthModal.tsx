'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal = memo(function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const router = useRouter();

  useEffect(() => {
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isSubmitting]);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isLogin]);

  const addDebugLog = useCallback((message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    addDebugLog('Form submitted');

    try {
      addDebugLog(`Attempting sign in with: ${formData.email}`);
      addDebugLog('Calling NextAuth signIn...');
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      addDebugLog(`SignIn result: ${result?.ok ? 'Success' : 'Failed'}`);

      if (result?.ok) {
        // On success, close modal and refresh session
        router.refresh(); // Refresh the current route
        onClose(); // Close the modal
      } else {
        setError(result?.error || 'Sign in failed. Please try again.');
      }
    } catch (err) {
      addDebugLog(`Error during sign in: ${err}`);
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onClose, router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    addDebugLog(`✏️ Input changed: ${name}`);
  }, [addDebugLog]);

  const handleToggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setFormData({ email: '', password: '' });
    setError('');
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (!isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  const clearDebugLogs = useCallback(() => {
    setDebugInfo([]);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleBackdropClick}
        data-testid="modal-backdrop"
      />
      <div 
        className="relative z-[101] w-full max-w-md mx-auto"
        role="dialog"
        aria-labelledby="auth-modal-title"
        aria-modal="true"
      >
        <div className="bg-[#0A1A2F] rounded-lg shadow-2xl p-8 border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 id="auth-modal-title" className="text-2xl font-bold text-white">
              {isLogin ? 'Sign in' : 'Sign up'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                required
                aria-label="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                required
                aria-label="Password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-label={isLogin ? "Sign in" : "Sign up"}
            >
              {isSubmitting ? 'Signing in...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>

            <div className="text-sm text-center">
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-blue-400 hover:text-blue-300"
              >
                {isLogin ? 'Create an account' : 'Already have an account?'}
              </button>
            </div>
          </form>

          {debugInfo.length > 0 && (
            <div className="mt-4 p-2 bg-gray-900 rounded border border-gray-700 text-xs">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-400">Debug Info {isSubmitting && '(Submitting...)'}</h3>
                <button 
                  onClick={clearDebugLogs}
                  className="text-gray-500 hover:text-gray-300 text-xs"
                  disabled={isSubmitting}
                >
                  Clear
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {debugInfo.map((log, i) => (
                  <div key={i} className="text-gray-400 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AuthModal; 