'use client';

import AppLayout from '@/components/AppLayout';
import { styles } from '@/lib/design-system';

export default function TimelinePage() {
  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${styles.textGold} mb-2`}>Chronological Timeline</h1>
          <p className={styles.textSecondary}>
            View books in chronological order (coming soon)
          </p>
        </div>

        <div className={`${styles.card} p-12 text-center`}>
          <h2 className={`text-2xl font-bold mb-4 ${styles.textGold}`}>
            Timeline View Coming Soon
          </h2>
          <p className={`${styles.textSecondary} max-w-xl mx-auto`}>
            We&apos;re working on a chronological timeline view to help you explore the Warhammer 40K universe
            in the order events occurred in-universe. Check back soon!
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
