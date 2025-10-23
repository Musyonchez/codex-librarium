'use client';

import { useState, useEffect, useMemo } from 'react';
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

export default function AnthologiesByNamePage() {
  const [anthologies, setAnthologies] = useState<Anthology[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Sort alphabetically
  const sortedAnthologies = useMemo(() => {
    return [...anthologies].sort((a, b) => a.title.localeCompare(b.title));
  }, [anthologies]);

  // Filter by search query
  const filteredAnthologies = useMemo(() => {
    if (!searchQuery) return sortedAnthologies;

    const query = searchQuery.toLowerCase();
    return sortedAnthologies.filter(
      (anthology) =>
        anthology.title.toLowerCase().includes(query) ||
        anthology.author.toLowerCase().includes(query)
    );
  }, [sortedAnthologies, searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Anthologies by Name</h1>
          <p className="text-slate-400">
            Warhammer 40K anthologies in alphabetical order
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className={`${styles.card} p-4 mb-6`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                className={`w-full px-4 py-2 ${styles.bgElevated} border border-slate-700 rounded focus:outline-none focus:border-[#D4AF37] ${styles.textPrimary}`}
              />
            </div>

            {/* Results count */}
            <div className={`mb-4 ${styles.textSecondary} text-sm`}>
              Showing {filteredAnthologies.length} {filteredAnthologies.length === 1 ? 'anthology' : 'anthologies'}
            </div>

            {/* Anthologies List */}
            {filteredAnthologies.length === 0 ? (
              <div className={`${styles.card} p-12 text-center`}>
                <p className={`${styles.textSecondary} text-lg`}>
                  No anthologies found matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredAnthologies.map((anthology) => (
                  <div
                    key={anthology.id}
                    className={`${styles.card} p-6 hover:${styles.bgElevated} transition-colors cursor-pointer`}
                  >
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
                      <div className="flex flex-wrap gap-2">
                        {anthology.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 ${styles.bgMain} rounded text-xs ${styles.textMuted}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
