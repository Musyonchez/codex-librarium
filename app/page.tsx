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
            Warhammer 40K Reading Tracker
          </h1>
          <p className={`text-xl md:text-2xl mb-8 ${styles.textSecondary} max-w-3xl mx-auto`}>
            Track your journey through 150+ books across 32 Black Library series.
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
              32 Complete Series
            </h3>
            <p className={styles.textSecondary}>
              Browse 150+ books across 32 series including The Horus Heresy, Dawn of Fire, Gaunt's Ghosts,
              Eisenhorn, Night Lords, and many more. Follow Black Library publication order.
            </p>
          </div>

          <div className={`${styles.card} p-6`}>
            <h3 className={`text-xl font-bold mb-3 ${styles.textGold}`}>
              Track Progress
            </h3>
            <p className={styles.textSecondary}>
              Mark books as unread, reading, or completed. View your progress statistics
              and see which books to tackle next in your collection.
            </p>
          </div>

          <div className={`${styles.card} p-6`}>
            <h3 className={`text-xl font-bold mb-3 ${styles.textGold}`}>
              Sync Across Devices
            </h3>
            <p className={styles.textSecondary}>
              Sign in with Google to sync your reading progress across all your devices.
              Never lose track of where you are in the series.
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
                  Explore the complete collection organized by series and reading order.
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
                  View your dashboard to see completion rates, series progress, and recommendations for what to read next.
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
