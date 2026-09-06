import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-base text-slate-600">Page not found</p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 rounded-md transition-colors"
        >
          Return to Landing
        </Link>
      </div>
    </div>
  );
}
