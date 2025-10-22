'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import { styles } from '@/lib/design-system';

interface Novella {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

export default function NovellasPage() {
  const [novellas, setNovellas] = useState<Novella[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovellas();
  }, []);

  const fetchNovellas = async () => {
    try {
      const response = await fetch('/api/novellas');
      const data = await response.json();
      setNovellas(data.novellas || []);
    } catch (error) {
      console.error('Failed to fetch novellas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Novellas</h1>
          <p className="text-slate-400">
            Warhammer 40K novellas and shorter works
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : novellas.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-400 text-xl">No novellas found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {novellas.map((novella) => (
              <div key={novella.id} className={`${styles.card} p-6`}>
                <h3 className={`text-xl font-bold ${styles.textGold} mb-2`}>
                  {novella.title}
                </h3>
                <p className={`${styles.textSecondary} mb-4`}>
                  by {novella.author}
                </p>
                {novella.faction && novella.faction.length > 0 && (
                  <div className="mb-2">
                    <span className={`text-sm ${styles.textSecondary}`}>Factions: </span>
                    <span className={styles.textPrimary}>{novella.faction.join(', ')}</span>
                  </div>
                )}
                {novella.tags && novella.tags.length > 0 && (
                  <div>
                    <span className={`text-sm ${styles.textSecondary}`}>Tags: </span>
                    <span className={styles.textPrimary}>{novella.tags.join(', ')}</span>
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
