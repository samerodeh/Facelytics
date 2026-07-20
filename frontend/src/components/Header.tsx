import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { LogOut, ScanFace } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/70 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-accent/40 bg-accent-glow">
            <ScanFace size={22} className="text-accent transition-transform group-hover:scale-110" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-700 tracking-wide text-content">
              Face<span className="text-accent">lytics</span>
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-content-faint">
              Recognition Engine
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-content-muted sm:flex">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(52,229,176,0.6)]" />
                <span className="font-mono text-xs">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-ghost px-4 py-2 text-sm text-danger-soft hover:border-danger/40"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost px-4 py-2 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary px-4 py-2 text-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
