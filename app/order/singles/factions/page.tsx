'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import BookDetailsModal from '@/components/BookDetailsModal';
import { ReadingStatus } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';
import { toast } from 'sonner';

interface Single {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

interface ReadingProgress {
  book_id: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
}

export default function SinglesByFactionsPage() {
  const [singles, setSingles] = useState<Single[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [selectedSingle, setSelectedSingle] = useState<Single | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSingles(), fetchReadingProgress()]);
    setLoading(false);
  };

  const fetchSingles = async () => {
    try {
      const response = await fetch('/api/singles');
      const data = await response.json();
      setSingles(data.singles || []);
    } catch (error) {
      console.error('Failed to fetch singles:', error);
    }
  };

  const fetchReadingProgress = async () => {
    try {
      const response = await fetch('/api/reading/singles');
      if (!response.ok) {
        setReadingProgress([]);
        return;
      }
      const data = await response.json();
      setReadingProgress(data.progress || []);
    } catch (error) {
      console.error('Failed to fetch reading progress:', error);
      setReadingProgress([]);
    }
  };

  const updateReadingStatus = async (bookId: string, status: ReadingStatus) => {
    try {
      const response = await fetch('/api/reading/singles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, status }),
      });

      if (!response.ok) {
        console.error('Failed to update status');
        return;
      }

      await fetchReadingProgress();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatus = (bookId: string): ReadingStatus => {
    const entry = readingProgress.find(r => r.book_id === bookId);
    return entry?.status || 'unread';
  };

  const handleStatusChange = (bookId: string, bookTitle: string, status: ReadingStatus) => {
    updateReadingStatus(bookId, status);
    setSelectedSingle(null);

    toast.success(`${bookTitle}`, {
      description: `Marked as ${statusLabels[status]}`,
    });
  };

  // Group singles by factions
  const singlesByFaction = useMemo(() => {
    const factionMap = new Map<string, Single[]>();

    singles.forEach((single) => {
      if (single.faction && single.faction.length > 0) {
        single.faction.forEach((faction) => {
          if (!factionMap.has(faction)) {
            factionMap.set(faction, []);
          }
          factionMap.get(faction)!.push(single);
        });
      }
    });

    // Sort factions alphabetically
    const sortedFactions = new Map(
      Array.from(factionMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );

    return sortedFactions;
  }, [singles]);

  // Filter factions by search query
  const filteredFactions = useMemo(() => {
    if (!searchQuery) return Array.from(singlesByFaction.keys());

    const query = searchQuery.toLowerCase();
    return Array.from(singlesByFaction.keys()).filter((faction) =>
      faction.toLowerCase().includes(query)
    );
  }, [singlesByFaction, searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Singles by Factions</h1>
          <p className="text-slate-400">
            Browse standalone novels grouped by factions - click a faction to see all books featuring that faction
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
                placeholder="Search factions..."
                className={`w-full px-4 py-2 ${styles.bgElevated} border border-slate-700 rounded focus:outline-none focus:border-[#D4AF37] ${styles.textPrimary}`}
              />
            </div>

            {/* Faction Selection */}
            {selectedFaction ? (
              <div className="mb-6">
                <button
                  onClick={() => setSelectedFaction(null)}
                  className={`text-sm ${styles.textSecondary} hover:${styles.textGold} mb-4`}
                >
                  ← Back to all factions
                </button>

                <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>
                  {selectedFaction} ({singlesByFaction.get(selectedFaction)?.length || 0} books)
                </h2>

                <div className="grid gap-2">
                  {singlesByFaction.get(selectedFaction)?.map((single) => {
                    const status = getStatus(single.id);
                    const statusIcon = statusIcons[status];

                    return (
                      <div
                        key={single.id}
                        className={styles.bookCard}
                        onClick={() => setSelectedSingle(single)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 text-center">
                            <span className={`text-2xl ${styles.textGold}`}>{statusIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                              {single.title}
                            </h3>
                            <div className={`flex flex-wrap gap-3 text-sm ${styles.textSecondary}`}>
                              <span>by {single.author}</span>
                              {single.tags && single.tags.length > 0 && single.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className={styles.textMuted}>• {tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className={`flex-shrink-0 text-xs ${styles.textMuted} uppercase tracking-wider`}>
                            {statusLabels[status]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className={`mb-4 ${styles.textSecondary} text-sm`}>
                  {filteredFactions.length} {filteredFactions.length === 1 ? 'faction' : 'factions'} available
                </div>

                {filteredFactions.length === 0 ? (
                  <div className={`${styles.card} p-12 text-center`}>
                    <p className={`${styles.textSecondary} text-lg`}>
                      No factions found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {filteredFactions.map((faction) => {
                      const count = singlesByFaction.get(faction)?.length || 0;
                      return (
                        <button
                          key={faction}
                          onClick={() => setSelectedFaction(faction)}
                          className={`px-4 py-2 ${styles.bgElevated} ${styles.textSecondary} hover:${styles.textGold} hover:bg-slate-700 rounded transition-colors text-left`}
                        >
                          <div className="font-semibold">{faction}</div>
                          <div className="text-xs">{count} {count === 1 ? 'book' : 'books'}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Book Details Modal */}
        {selectedSingle && (
          <BookDetailsModal
            book={selectedSingle}
            currentStatus={getStatus(selectedSingle.id)}
            onClose={() => setSelectedSingle(null)}
            onStatusChange={(status) => handleStatusChange(selectedSingle.id, selectedSingle.title, status)}
          />
        )}
      </div>
    </AppLayout>
  );
}
