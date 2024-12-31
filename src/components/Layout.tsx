import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Header implementation */}
      <main>{children}</main>
    </div>
  );
}