'use client';

import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { styles } from '@/lib/design-system';

export default function Home() {
  return (
    <AppLayout requireAuth={false}>
      {/* Hero Section - Full viewport height minus navbar */}
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${styles.textGold}`}>
            Codex Librarium
          </h1>
          <p className={`text-xl md:text-2xl mb-8 ${styles.textSecondary} max-w-3xl mx-auto`}>
            Track your journey through 387+ books across 76 series, 85 singles, 97 novellas, and 129 anthologies.
            Organize your reading, monitor progress, and never lose your place in the grim darkness of the far future.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/order/series" className={styles.btnPrimary}>
              Browse Series
            </Link>
            <Link href="/dashboard" className={styles.btnSecondary}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features and Content Section */}
      <div className="container mx-auto px-4 py-16">

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className={`${styles.card} p-6`}>
            <h3 className={`text-xl font-bold mb-3 ${styles.textGold}`}>
              Massive Collection
            </h3>
            <p className={styles.textSecondary}>
              387+ books across 76 series including The Horus Heresy, Dawn of Fire, Gaunt&apos;s Ghosts,
              plus 85 singles, 97 novellas, and 129 anthologies. Follow Black Library publication order.
            </p>
          </div>

          <div className={`${styles.card} p-6`}>
            <h3 className={`text-xl font-bold mb-3 ${styles.textGold}`}>
              Organized by Category
            </h3>
            <p className={styles.textSecondary}>
              Browse books by Series, Singles, Novellas, or Anthologies. Filter by Name, Tags, or Factions
              to find exactly what you&apos;re looking for.
            </p>
          </div>

          <div className={`${styles.card} p-6`}>
            <h3 className={`text-xl font-bold mb-3 ${styles.textGold}`}>
              Tabbed Dashboards
            </h3>
            <p className={styles.textSecondary}>
              Separate dashboards for each category with progress tracking, statistics, and completion rates.
              Sync across all your devices with Google sign-in.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className={`${styles.card} p-8 max-w-4xl mx-auto`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${styles.textGold}`}>
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] text-slate-900 flex items-center justify-center font-bold`}>
                1
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${styles.textPrimary}`}>Sign In</h4>
                <p className={styles.textSecondary}>
                  Create an account or sign in with Google to get started.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] text-slate-900 flex items-center justify-center font-bold`}>
                2
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${styles.textPrimary}`}>Browse Books</h4>
                <p className={styles.textSecondary}>
                  Explore Series, Singles, Novellas, and Anthologies. Filter by Name, Tags, or Factions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] text-slate-900 flex items-center justify-center font-bold`}>
                3
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${styles.textPrimary}`}>Track Progress</h4>
                <p className={styles.textSecondary}>
                  Click on any book to mark it as unread, reading, or completed. Your progress is saved automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] text-slate-900 flex items-center justify-center font-bold`}>
                4
              </div>
              <div>
                <h4 className={`font-semibold mb-1 ${styles.textPrimary}`}>Monitor Stats</h4>
                <p className={styles.textSecondary}>
                  View tabbed dashboards for each category to see completion rates, progress statistics, and what to read next.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className={`text-3xl font-bold mb-4 ${styles.textGold}`}>
            Ready to Begin Your Journey?
          </h2>
          <p className={`text-lg mb-6 ${styles.textSecondary}`}>
            Join fellow readers tracking their way through the Warhammer 40K universe
          </p>
          <Link href="/order/series" className={styles.btnPrimary}>
            Start Tracking
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
