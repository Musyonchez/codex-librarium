'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { styles } from '@/lib/design-system';

interface NavbarProps {
  user: { email?: string } | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/series', label: 'By Series' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className={`${styles.bgCard} border-b ${styles.border} sticky top-0 z-50 backdrop-blur-sm bg-slate-800/95`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className={`text-2xl font-bold ${styles.textGold}`}>
              WH40K Tracker
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(link.href)
                    ? `${styles.textGold} bg-slate-700`
                    : `${styles.textSecondary} hover:text-slate-50 hover:bg-slate-700`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <span className={`text-sm ${styles.textSecondary} hidden sm:inline`}>
                  {user.email}
                </span>
                <button onClick={onLogout} className={styles.btnSecondary}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={onLogin} className={styles.btnPrimary}>
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.href)
                  ? `${styles.textGold} bg-slate-700`
                  : `${styles.textSecondary} hover:text-slate-50 hover:bg-slate-700`
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
