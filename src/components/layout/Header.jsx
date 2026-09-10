import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { getActiveRole } from '../../services/roleState';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());

  useEffect(() => {
    const handleSync = () => setActiveRoleState(getActiveRole());
    window.addEventListener('samadhan_active_role_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('samadhan_active_role_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const mainNavItems = [
    { name: 'Challenges', path: '/challenges' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Impact', path: '/impact' },
  ];

  const platformNavItems = [
    { name: 'AI Analysis', path: '/ai-analysis', badge: 'AI' },
    { name: 'Project Lifecycle', path: '/project-lifecycle' },
    { name: 'Government', path: '/government' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo / Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none shrink-0"
            aria-label="Samadhan Setu Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-900 text-white shadow-xs ring-1 ring-indigo-950/10 group-hover:bg-indigo-800 transition-colors">
              {/* Refined emblem: bridge & node connection */}
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19h16" />
                <path d="M6 19v-4a6 6 0 0 1 12 0v4" />
                <path d="M12 9V3" />
                <circle cx="12" cy="3" r="1.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                Samadhan Setu
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 tracking-normal">
                From Problems to Solutions.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary Navigation">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1" aria-hidden="true" />

            {platformNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-indigo-950 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {activeRole ? (
              <Link
                to="/login"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  activeRole === 'university'
                    ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                    : activeRole === 'industry'
                    ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                    : activeRole === 'government'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
                title="Active demonstration role — click to switch role"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>
                  Role: {activeRole === 'university'
                    ? 'University'
                    : activeRole === 'industry'
                    ? 'Industry'
                    : activeRole === 'government'
                    ? 'Government'
                    : 'Citizen'}
                </span>
                <span className="text-[10px] opacity-60">▾</span>
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                to="/login"
                className="text-slate-700 hover:text-slate-900"
              >
                Login
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              to="/report"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Report a Problem
            </Button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 lg:hidden">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Explore</p>
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Modules</p>
            {platformNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-950 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-violet-100 text-violet-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              to="/report"
              fullWidth
              onClick={() => setMobileMenuOpen(false)}
            >
              Report a Problem
            </Button>
            <Button
              variant="secondary"
              size="md"
              to="/login"
              fullWidth
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
