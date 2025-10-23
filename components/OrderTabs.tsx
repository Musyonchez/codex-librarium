'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { styles } from '@/lib/design-system';

export default function OrderTabs() {
  const pathname = usePathname();

  // Determine which category we're in
  const category = pathname.split('/')[2]; // 'series', 'singles', 'novellas', or 'anthologies'
  const basePath = `/order/${category}`;

  // Series has "By Series" as default, others have "By Name" as default
  const orderLinks = category === 'series'
    ? [
        { href: '/order/series', label: 'By Series' },
        { href: '/order/series/name', label: 'By Name' },
        { href: '/order/series/tags', label: 'By Tags' },
        { href: '/order/series/factions', label: 'By Factions' },
      ]
    : [
        { href: `${basePath}/name`, label: 'By Name' },
        { href: `${basePath}/tags`, label: 'By Tags' },
        { href: `${basePath}/factions`, label: 'By Factions' },
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
