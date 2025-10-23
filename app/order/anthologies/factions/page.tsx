'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import BookDetailsModal from '@/components/BookDetailsModal';
import { ReadingStatus } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';
import { toast } from 'sonner';

interface Anthology {
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

export default function AnthologiesByFactionsPage() {
  const [anthologies, setAnthologies] = useState<Anthology[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [selectedAnthology, setSelectedAnthology] = useState<Anthology | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAnthologies(), fetchReadingProgress()]);
    setLoading(false);
  };

  const fetchAnthologies = async () => {
    try {
      const response = await fetch('/api/anthologies');
      const data = await response.json();
      setAnthologies(data.anthologies || []);
    } catch (error) {
      console.error('Failed to fetch anthologies:', error);
    }
  };

  const fetchReadingProgress = async () => {
    try {
      const response = await fetch('/api/reading/anthologies');
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
      const response = await fetch('/api/reading/anthologies', {
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
    setSelectedAnthology(null);

    toast.success(`${bookTitle}`, {
      description: `Marked as ${statusLabels[status]}`,
    });
  };

  // Group anthologies by factions
  const anthologiesByFaction = useMemo(() => {
    const factionMap = new Map<string, Anthology[]>();

    anthologies.forEach((anthology) => {
      if (anthology.faction && anthology.faction.length > 0) {
        anthology.faction.forEach((faction) => {
          if (!factionMap.has(faction)) {
            factionMap.set(faction, []);
          }
          factionMap.get(faction)!.push(anthology);
        });
      }
    });

    // Sort factions alphabetically
    const sortedFactions = new Map(
      Array.from(factionMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );

    return sortedFactions;
  }, [anthologies]);

  // Filter factions by search query
  const filteredFactions = useMemo(() => {
    if (!searchQuery) return Array.from(anthologiesByFaction.keys());

    const query = searchQuery.toLowerCase();
    return Array.from(anthologiesByFaction.keys()).filter((faction) =>
      faction.toLowerCase().includes(query)
    );
  }, [anthologiesByFaction, searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Anthologies by Factions</h1>
          <p className="text-slate-400">
            Browse anthologies grouped by factions - click a faction to see all books featuring that faction
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
                  {selectedFaction} ({anthologiesByFaction.get(selectedFaction)?.length || 0} books)
                </h2>

                <div className="grid gap-2">
                  {anthologiesByFaction.get(selectedFaction)?.map((anthology) => {
                    const status = getStatus(anthology.id);
                    const statusIcon = statusIcons[status];

                    return (
                      <div
                        key={anthology.id}
                        className={styles.bookCard}
                        onClick={() => setSelectedAnthology(anthology)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 text-center">
                            <span className={`text-2xl ${styles.textGold}`}>{statusIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                              {anthology.title}
                            </h3>
                            <div className={`flex flex-wrap gap-3 text-sm ${styles.textSecondary}`}>
                              <span>by {anthology.author}</span>
                              {anthology.tags && anthology.tags.length > 0 && anthology.tags.slice(0, 3).map((tag) => (
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
                      const count = anthologiesByFaction.get(faction)?.length || 0;
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
        {selectedAnthology && (
          <BookDetailsModal
            book={selectedAnthology}
            currentStatus={getStatus(selectedAnthology.id)}
            onClose={() => setSelectedAnthology(null)}
            onStatusChange={(status) => handleStatusChange(selectedAnthology.id, selectedAnthology.title, status)}
          />
        )}
      </div>
    </AppLayout>
  );
}
