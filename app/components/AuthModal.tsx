'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal = memo(function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isLogin]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted.current) return;
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        ...formData
      });

      if (!mounted.current) return;

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        onLoginSuccess();
        onClose();
      }
    } catch (err) {
      if (mounted.current) {
        setError('An error occurred');
      }
    }
  }, [formData, onClose, onLoginSuccess]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleToggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setFormData({ email: '', password: '' });
    setError('');
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
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
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
              aria-label={isLogin ? "Sign in" : "Sign up"}
            >
              {isLogin ? 'Sign in' : 'Sign up'}
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
        </div>
      </div>
    </div>
  );
});

export default AuthModal; 