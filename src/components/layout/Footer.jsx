import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-900 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19h16" />
                  <path d="M6 19v-4a6 6 0 0 1 12 0v4" />
                  <path d="M12 9V3" />
                  <circle cx="12" cy="3" r="1.5" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-base">Samadhan Setu</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              From Problems to Solutions.
            </p>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              A collaborative problem-solving platform connecting citizen-reported challenges with university research and industry implementation partners.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link to="/" className="hover:text-slate-900 transition-colors">
                  Challenges
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-slate-900 transition-colors">
                  Report a Problem
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="hover:text-slate-900 transition-colors">
                  AI Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Lifecycle & Administration */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Governance</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link to="/project" className="hover:text-slate-900 transition-colors">
                  Project Lifecycle
                </Link>
              </li>
              <li>
                <Link to="/government" className="hover:text-slate-900 transition-colors">
                  Government Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>Smart India Hackathon 2026 — Problem Statement SIH26043</p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-slate-600 font-medium">Design System & Shell Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
