import Link from 'next/link';
import { styles } from '@/lib/design-system';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Number */}
        <div className={`text-9xl font-bold ${styles.textGold} mb-4`}>
          404
        </div>

        {/* Warhammer-themed message */}
        <h1 className={`text-3xl font-bold ${styles.textPrimary} mb-4`}>
          Page Not Found in the Imperial Archives
        </h1>

        <p className={`${styles.textSecondary} text-lg mb-8 leading-relaxed`}>
          The page you seek has been lost to the Warp, purged by the Inquisition,
          or perhaps it never existed in the first place. Even the Emperor&apos;s finest
          cannot recover what is not here.
        </p>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className={`${styles.btnPrimary} inline-block`}
          >
            Return to Dashboard
          </Link>
          <Link
            href="/order/series"
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${styles.bgElevated} ${styles.textSecondary} hover:${styles.textGold} hover:bg-slate-700 inline-block`}
          >
            Browse Books
          </Link>
        </div>

        {/* Flavor text */}
        <div className={`mt-12 ${styles.textMuted} text-sm italic`}>
          &ldquo;Knowledge is power, guard it well.&rdquo;
        </div>
      </div>
    </div>
  );
}
