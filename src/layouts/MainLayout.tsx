import React, { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { BreakingNewsBar } from '../components/common/BreakingNewsBar';
import { Footer } from '../components/common/Footer';
import { Home, TrendingUp, Newspaper, FileText, Search } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Markets', path: '/economy', icon: TrendingUp, hasDot: true },
    { label: 'National', path: '/national', icon: Newspaper },
    { label: 'Dossiers', path: '/investigations', icon: FileText },
    { label: 'Search', path: '/search', icon: Search },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased selection:bg-amber-500 selection:text-white">
      <Header />
      {pathname === '/' && <BreakingNewsBar />}
      <main className="flex-1 w-full bg-white">
        <Outlet />
      </main>
      <Footer />

      {/* Signature Mobile Bottom Navigation Bar (Solid White with Rounded Corners) */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40 bg-white border border-gray-200 rounded-2xl h-14 flex items-center justify-around px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                active
                  ? 'text-gray-950 font-bold'
                  : 'text-gray-500 hover:text-gray-900 font-normal'
              }`}
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5"
                />
                {item.hasDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
