'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import { ReadingTracker, BooksMetadata, ReadingStatus, Book } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';
import { toast } from 'sonner';

export default function OrderByFactionsPage() {
  const [readingTracker, setReadingTracker] = useState<ReadingTracker>({ readingData: [] });
  const [booksMetadata, setBooksMetadata] = useState<BooksMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBooksMetadata(), fetchReadingTracker()]);
    setLoading(false);
  };

  const fetchBooksMetadata = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooksMetadata(data);
    } catch (error) {
      console.error('Failed to fetch books metadata:', error);
    }
  };

  const fetchReadingTracker = async () => {
    try {
      const response = await fetch('/api/reading');
      if (!response.ok) {
        setReadingTracker({ readingData: [] });
        return;
      }
      const data = await response.json();
      setReadingTracker(data);
    } catch (error) {
      console.error('Failed to fetch reading tracker:', error);
      setReadingTracker({ readingData: [] });
    }
  };

  const updateReadingStatus = async (bookId: string, status: ReadingStatus) => {
    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, status }),
      });

      if (!response.ok) {
        console.error('Failed to update status - not authenticated?');
        return;
      }

      await fetchReadingTracker();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatus = (bookId: string): ReadingStatus => {
    const entry = readingTracker?.readingData?.find(r => r.bookId === bookId);
    return entry?.status || 'unread';
  };

  const cycleStatus = (bookId: string, bookTitle: string) => {
    const currentStatus = getStatus(bookId);
    const statusOrder: ReadingStatus[] = ['unread', 'reading', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateReadingStatus(bookId, nextStatus);

    toast.success(`${bookTitle}`, {
      description: `Marked as ${statusLabels[nextStatus]}`,
    });
  };

  // Group books by factions
  const booksByFaction = useMemo(() => {
    if (!booksMetadata) return new Map<string, Array<Book & { seriesName: string }>>();

    type BookWithSeries = Book & { seriesName: string };
    const factionMap = new Map<string, BookWithSeries[]>();

    booksMetadata.series.forEach((series) => {
      series.books.forEach((book) => {
        const bookWithSeries: BookWithSeries = {
          ...book,
          seriesName: series.name,
        };

        if (book.faction && book.faction.length > 0) {
          book.faction.forEach((faction) => {
            if (!factionMap.has(faction)) {
              factionMap.set(faction, []);
            }
            factionMap.get(faction)!.push(bookWithSeries);
          });
        }
      });
    });

    // Sort factions alphabetically
    const sortedFactions = new Map(
      Array.from(factionMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );

    return sortedFactions;
  }, [booksMetadata]);

  // Filter factions by search query
  const filteredFactions = useMemo(() => {
    if (!searchQuery) return Array.from(booksByFaction.keys());

    const query = searchQuery.toLowerCase();
    return Array.from(booksByFaction.keys()).filter((faction) =>
      faction.toLowerCase().includes(query)
    );
  }, [booksByFaction, searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Books by Factions</h1>
          <p className="text-slate-400">
            Browse books grouped by factions - click a faction to see all books featuring that faction
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : !booksMetadata ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-xl">Failed to load books. Please refresh.</div>
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
                  {selectedFaction} ({booksByFaction.get(selectedFaction)?.length || 0} books)
                </h2>

                <div className="grid gap-2">
                  {booksByFaction.get(selectedFaction)?.map((book) => {
                    const status = getStatus(book.id);
                    const statusIcon = statusIcons[status];

                    return (
                      <div
                        key={book.id}
                        className={styles.bookCard}
                        onClick={() => cycleStatus(book.id, book.title)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 text-center">
                            <span className={`text-2xl ${styles.textGold}`}>{statusIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                              {book.title}
                            </h3>
                            <div className={`flex flex-wrap gap-3 text-sm ${styles.textSecondary}`}>
                              <span>by {book.author}</span>
                              <span className={styles.textMuted}>• {book.seriesName}</span>
                              {book.tags && book.tags.length > 0 && book.tags.slice(0, 3).map((tag) => (
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
                      const count = booksByFaction.get(faction)?.length || 0;
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
      </div>
    </AppLayout>
  );
}
