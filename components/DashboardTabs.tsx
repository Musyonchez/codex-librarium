'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { styles } from '@/lib/design-system';

export default function DashboardTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard', label: 'Series' },
    { href: '/dashboard/singles', label: 'Singles' },
    { href: '/dashboard/novellas', label: 'Novellas' },
    { href: '/dashboard/anthologies', label: 'Anthologies' },
  ];

  return (
    <div className="border-b border-slate-700 mb-8">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              pathname === tab.href
                ? `${styles.textGold} border-b-2 border-[#D4AF37]`
                : `${styles.textSecondary} hover:${styles.textPrimary}`
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
