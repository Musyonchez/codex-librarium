'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import { styles } from '@/lib/design-system';

interface Single {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

export default function SinglesPage() {
  const [singles, setSingles] = useState<Single[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSingles();
  }, []);

  const fetchSingles = async () => {
    try {
      const response = await fetch('/api/singles');
      const data = await response.json();
      setSingles(data.singles || []);
    } catch (error) {
      console.error('Failed to fetch singles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Single Novels</h1>
          <p className="text-slate-400">
            Standalone Warhammer 40K novels
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : singles.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-400 text-xl">No singles found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {singles.map((single) => (
              <div key={single.id} className={`${styles.card} p-6`}>
                <h3 className={`text-xl font-bold ${styles.textGold} mb-2`}>
                  {single.title}
                </h3>
                <p className={`${styles.textSecondary} mb-4`}>
                  by {single.author}
                </p>
                {single.faction && single.faction.length > 0 && (
                  <div className="mb-2">
                    <span className={`text-sm ${styles.textSecondary}`}>Factions: </span>
                    <span className={styles.textPrimary}>{single.faction.join(', ')}</span>
                  </div>
                )}
                {single.tags && single.tags.length > 0 && (
                  <div>
                    <span className={`text-sm ${styles.textSecondary}`}>Tags: </span>
                    <span className={styles.textPrimary}>{single.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
