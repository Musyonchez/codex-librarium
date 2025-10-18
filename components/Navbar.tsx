"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { styles } from "@/lib/design-system";

interface NavbarProps {
  user: { email?: string } | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status when user changes
  useEffect(() => {
    if (user?.email) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/import/check-admin');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const navLinks = [{ href: "/dashboard", label: "Dashboard" }];

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  // Extract username from email (remove @domain.com) and limit to 15 chars
  const getUsername = (email?: string) => {
    if (!email) return "";
    const username = email.split("@")[0];
    return username.length > 15 ? username.substring(0, 15) + "..." : username;
  };

  return (
    <nav
      className={`${styles.bgCard} border-b ${styles.border} sticky top-0 z-50 backdrop-blur-sm bg-slate-800/95`}
    >
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className={`text-2xl font-bold ${styles.textGold}`}>
              Codex Librarium
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Dashboard Link */}
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

            {/* Order By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowOrderDropdown(!showOrderDropdown)}
                onMouseEnter={() => setShowOrderDropdown(true)}
                onMouseLeave={() => setShowOrderDropdown(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  pathname.startsWith("/order") || pathname.startsWith("/series")
                    ? `${styles.textGold} bg-slate-700`
                    : `${styles.textSecondary} hover:text-slate-50 hover:bg-slate-700`
                }`}
              >
                Order by
              </button>

              {showOrderDropdown && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50"
                  onMouseEnter={() => setShowOrderDropdown(true)}
                  onMouseLeave={() => setShowOrderDropdown(false)}
                >
                  <Link
                    href="/order/series"
                    onClick={() => setShowOrderDropdown(false)}
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                  >
                    By Series
                  </Link>
                  <Link
                    href="/order/name"
                    onClick={() => setShowOrderDropdown(false)}
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                  >
                    By Name
                  </Link>
                  <Link
                    href="/order/tags"
                    onClick={() => setShowOrderDropdown(false)}
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                  >
                    By Tags
                  </Link>
                  <Link
                    href="/order/factions"
                    onClick={() => setShowOrderDropdown(false)}
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                  >
                    By Factions
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Auth Section */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  onMouseEnter={() => setShowUserDropdown(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.textGold} hover:bg-slate-700`}
                >
                  {getUsername(user.email)}
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    {/* Mobile Navigation Items */}
                    <div className="md:hidden border-b border-slate-700 pb-2 mb-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className={`block px-4 py-2 ${
                          pathname.startsWith('/dashboard')
                            ? `${styles.textGold}`
                            : 'text-slate-300'
                        } hover:bg-slate-700 transition-colors`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/order/series"
                        onClick={() => setShowUserDropdown(false)}
                        className={`block px-4 py-2 ${
                          pathname.startsWith('/order') || pathname.startsWith('/series')
                            ? `${styles.textGold}`
                            : 'text-slate-300'
                        } hover:bg-slate-700 transition-colors`}
                      >
                        Order by
                      </Link>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/import"
                        onClick={() => setShowUserDropdown(false)}
                        className={`block px-4 py-2 ${
                          pathname.startsWith('/import')
                            ? `${styles.textGold}`
                            : 'text-slate-300'
                        } hover:bg-slate-700 transition-colors`}
                      >
                        Import Books
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors border-t border-slate-700 mt-2 pt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onLogin} className={styles.btnPrimary}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
