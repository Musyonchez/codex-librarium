'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import { styles } from '@/lib/design-system';

interface Anthology {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

export default function AnthologiesPage() {
  const [anthologies, setAnthologies] = useState<Anthology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnthologies();
  }, []);

  const fetchAnthologies = async () => {
    try {
      const response = await fetch('/api/anthologies');
      const data = await response.json();
      setAnthologies(data.anthologies || []);
    } catch (error) {
      console.error('Failed to fetch anthologies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Anthologies</h1>
          <p className="text-slate-400">
            Warhammer 40K anthologies and collections
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : anthologies.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-400 text-xl">No anthologies found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {anthologies.map((anthology) => (
              <div key={anthology.id} className={`${styles.card} p-6`}>
                <h3 className={`text-xl font-bold ${styles.textGold} mb-2`}>
                  {anthology.title}
                </h3>
                <p className={`${styles.textSecondary} mb-4`}>
                  by {anthology.author}
                </p>
                {anthology.faction && anthology.faction.length > 0 && (
                  <div className="mb-2">
                    <span className={`text-sm ${styles.textSecondary}`}>Factions: </span>
                    <span className={styles.textPrimary}>{anthology.faction.join(', ')}</span>
                  </div>
                )}
                {anthology.tags && anthology.tags.length > 0 && (
                  <div>
                    <span className={`text-sm ${styles.textSecondary}`}>Tags: </span>
                    <span className={styles.textPrimary}>{anthology.tags.join(', ')}</span>
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
