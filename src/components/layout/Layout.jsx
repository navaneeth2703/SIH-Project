import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ variant = 'public', noHeader = false, children }) {
  const isFullBleed = variant === 'fullBleed';
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
      }
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!noHeader && <Header />}
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



