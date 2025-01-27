import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const MockAuthModal = ({ onClose, onLoginSuccess }: AuthModalProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', {
      email: 'test@example.com',
      password: 'password123'
    });
    onLoginSuccess();
  };

  return (
    <div role="dialog" aria-label="Authentication">
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" defaultValue="test@example.com" />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" defaultValue="password123" />
        <button type="submit" data-testid="auth-submit">Sign In</button>
        <button type="button" onClick={onClose}>Close</button>
      </form>
    </div>
  );
};

export const MockApp = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div>
      <nav>
        <a href="/upload" role="link" aria-label="Upload Logo">Upload Logo</a>
        <a href="/gallery" role="link" aria-label="Gallery">Gallery</a>
        <button onClick={() => setShowAuthForm(true)}>Sign In</button>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          role="button"
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
      {showAuthForm && (
        <MockAuthModal
          onClose={() => setShowAuthForm(false)}
          onLoginSuccess={() => setShowAuthForm(false)}
        />
      )}
      {children}
    </div>
  );
};

export const MockUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value);
    formData.append('description', (e.currentTarget.elements.namedItem('description') as HTMLInputElement).value);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Logo Name</label>
      <input type="text" id="name" name="name" required />
      
      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" required />
      
      <label htmlFor="file">Logo File</label>
      <input
        type="file"
        id="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        required
      />
      
      <button type="submit">Upload Logo</button>
      {success && <div role="alert">Logo uploaded successfully!</div>}
    </form>
  );
}; 