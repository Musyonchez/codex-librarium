'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { styles } from '@/lib/design-system';

export default function OrderTabs() {
  const pathname = usePathname();

  const orderLinks = [
    { href: '/order/series', label: 'By Series' },
    { href: '/order/name', label: 'By Name' },
    { href: '/order/tags', label: 'By Tags' },
    { href: '/order/factions', label: 'By Factions' },
  ];

  return (
    <div className="border-b border-slate-700 mb-8">
      <div className="flex gap-1 overflow-x-auto">
        {orderLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              pathname === link.href
                ? `${styles.textGold} border-b-2 border-[#D4AF37]`
                : `${styles.textSecondary} hover:${styles.textPrimary}`
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
