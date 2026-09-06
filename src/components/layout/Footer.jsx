import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Samadhan Setu</span>
              <span className="text-slate-400">·</span>
              <span className="text-sm text-slate-500">From Problems to Solutions.</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Smart India Hackathon 2026 — Problem Statement SIH26043
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <Link to="/report" className="hover:text-slate-800 transition-colors">
              Report Problem
            </Link>
            <Link to="/analysis" className="hover:text-slate-800 transition-colors">
              AI Analysis
            </Link>
            <Link to="/project" className="hover:text-slate-800 transition-colors">
              Project
            </Link>
            <Link to="/government" className="hover:text-slate-800 transition-colors">
              Government
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 Samadhan Setu. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Platform Shell Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
