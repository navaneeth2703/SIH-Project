import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { getActiveRole, clearActiveRole, PLATFORM_ROLES } from '../../services/roleState';
import {
  getNotificationsForRole,
  getUnreadCount,
  markNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../../services/notificationStore';
import { getAllCollaborationInterests } from '../../services/collaborationStore';

/**
 * Determine the active institution ID for University / Industry roles.
 * Uses the first institution that has expressed interest, as a lightweight
 * demo-identity approximation. For a real deployment this would come from auth.
 */
function getDemoInstitutionId(role) {
  if (role !== 'university' && role !== 'industry') return null;
  try {
    const all = getAllCollaborationInterests();
    const match = all.find((r) => r.role === role);
    return match?.institutionId || null;
  } catch {
    return null;
  }
}

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const syncRole = useCallback(() => {
    setActiveRoleState(getActiveRole());
  }, []);

  const syncNotifications = useCallback(() => {
    const role = getActiveRole();
    if (!role) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    // Government receives progress_update notifications targeted at 'government'
    const instId = role === 'government' ? 'government' : getDemoInstitutionId(role);
    const notifs = getNotificationsForRole(role, instId);
    setNotifications(notifs.slice(0, 8)); // Show max 8 in dropdown
    setUnreadCount(getUnreadCount(role, instId));
  }, []);

  useEffect(() => {
    window.addEventListener('samadhan_active_role_change', syncRole);
    window.addEventListener('storage', syncRole);
    return () => {
      window.removeEventListener('samadhan_active_role_change', syncRole);
      window.removeEventListener('storage', syncRole);
    };
  }, [syncRole]);

  useEffect(() => {
    syncNotifications();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, syncNotifications);
    window.addEventListener('storage', syncNotifications);
    window.addEventListener('samadhan_active_role_change', syncNotifications);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, syncNotifications);
      window.removeEventListener('storage', syncNotifications);
      window.removeEventListener('samadhan_active_role_change', syncNotifications);
    };
  }, [syncNotifications]);

  // Close notification panel when clicking outside
  useEffect(() => {
    if (!notifOpen) return;
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  function handleLogout() {
    clearActiveRole();
    navigate('/login');
  }

  function handleNotifClick(notif) {
    markNotificationRead(notif.id);
    syncNotifications();
    setNotifOpen(false);
    if (notif.challengeId) {
      navigate('/project-lifecycle', { state: { challengeId: notif.challengeId } });
    }
  }

  // Role-based navigation items
  const navItems = [
    ...(activeRole !== 'government'
      ? [{ name: 'Challenges', path: '/challenges' }]
      : []),
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Impact', path: '/impact' },
    ...(activeRole === 'citizen' || !activeRole
      ? [{ name: 'AI Analysis', path: '/ai-analysis', badge: 'AI' }]
      : []),
    ...(activeRole === 'citizen' || !activeRole
      ? [{ name: 'Project Lifecycle', path: '/project-lifecycle' }]
      : []),
    ...(activeRole === 'government'
      ? [{ name: 'Government', path: '/government' }]
      : []),
  ];

  // Notification bell: visible for all authenticated roles (Citizen, University, Industry, Government)
  // Government receives incoming stakeholder progress update notifications only
  const showBell = Boolean(activeRole);

  const roleDisplayName = PLATFORM_ROLES[activeRole]?.name || activeRole || '';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {activeRole === 'government' && (
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-amber-300 to-emerald-600" aria-hidden="true" />
      )}
      {activeRole === 'citizen' && (
        <div className="h-[2px] w-full bg-gradient-to-r from-teal-600 via-teal-400 to-sky-500" aria-hidden="true" />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo / Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none shrink-0"
            aria-label="Samadhan Setu Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-900 text-white shadow-xs ring-1 ring-indigo-950/10 group-hover:bg-indigo-800 transition-colors">
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
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? item.path === '/government'
                        ? 'text-amber-950 bg-amber-50/90 font-semibold border-b-2 border-amber-600 rounded-b-none'
                        : 'text-indigo-950 bg-indigo-50 font-semibold'
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

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {activeRole ? (
              <>
                {/* Notification Bell — Citizen / University / Industry only */}
                {showBell && (
                  <div className="relative" ref={notifRef}>
                    <button
                      id="header-notification-bell"
                      type="button"
                      onClick={() => setNotifOpen((o) => !o)}
                      className="relative inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                      title="Notifications"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>

                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <svg className="h-8 w-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-xs text-slate-400">No notifications yet.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Government decisions will appear here.
                            </p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                            {notifications.map((notif) => (
                              <li key={notif.id}>
                                <button
                                  type="button"
                                  onClick={() => handleNotifClick(notif)}
                                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                                    notif.read ? 'opacity-70' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    {!notif.read && (
                                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                                    )}
                                    {notif.read && (
                                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-200" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-slate-900 leading-snug">
                                        {notif.title}
                                      </p>
                                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                                        {notif.message}
                                      </p>
                                      {notif.challengeTitle && (
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                                          {notif.challengeTitle}
                                        </p>
                                      )}
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(notif.updatedAt).toLocaleString('en-IN', {
                                          dateStyle: 'medium',
                                          timeStyle: 'short',
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                          <p className="text-[10px] text-slate-400 text-center">
                            Prototype workspace notifications — not real-world alerts
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Role badge — click to switch role */}
                <Link
                  to="/login"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    activeRole === 'university'
                      ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                      : activeRole === 'industry'
                      ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                      : activeRole === 'government'
                      ? 'bg-gradient-to-r from-amber-50/90 via-white to-emerald-50/70 text-slate-800 border-amber-200/90 shadow-2xs hover:border-amber-300'
                      : activeRole === 'citizen'
                      ? 'bg-gradient-to-r from-teal-50/95 via-white to-sky-50/70 text-teal-950 border-teal-200/90 shadow-2xs hover:border-teal-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Active demonstration role — click to switch role"
                >
                  {activeRole === 'government' ? (
                    <span className="inline-flex items-center gap-0.5 shrink-0" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    </span>
                  ) : activeRole === 'citizen' ? (
                    <span className="inline-flex items-center gap-0.5 shrink-0" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                  <span>Role: {roleDisplayName}</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </Link>

                {/* Log Out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  title="Log out and return to role selection"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                  </svg>
                  Log Out
                </button>
              </>
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

            {/* Report a Problem CTA: Citizen or unauthenticated only */}
            {(!activeRole || activeRole === 'citizen') && (
              <Button
                variant="primary"
                size="sm"
                to="/report"
                className={activeRole === 'citizen' ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-semibold' : ''}
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Report a Problem
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
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
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {activeRole ? `${activeRole.toUpperCase()} WORKSPACE` : 'MENU'}
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? item.path === '/government'
                        ? 'bg-amber-50 text-amber-950 font-semibold border-l-2 border-amber-600'
                        : 'bg-indigo-50 text-indigo-950 font-semibold'
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
            {/* Mobile notifications count (non-interactive summary) */}
            {showBell && unreadCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 border border-indigo-100">
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm text-indigo-800 font-medium">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {(!activeRole || activeRole === 'citizen') && (
              <Button
                variant="primary"
                size="md"
                to="/report"
                fullWidth
                className={activeRole === 'citizen' ? 'bg-teal-700 hover:bg-teal-800 text-white font-semibold' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Report a Problem
              </Button>
            )}
            {activeRole ? (
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Log Out
              </button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                to="/login"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
