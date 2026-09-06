import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ variant = 'public', children }) {
  const isFullBleed = variant === 'fullBleed';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />
      <main
        className={
          isFullBleed
            ? 'flex-1 w-full'
            : 'flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10'
        }
      >
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

