'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import SeriesView from '@/components/SeriesView';
import { ReadingTracker, BooksMetadata, ReadingStatus } from '@/lib/types';
import { styles } from '@/lib/design-system';

type SortOption = 'default' | 'name-asc' | 'name-desc';

export default function SeriesPage() {
  const [readingTracker, setReadingTracker] = useState<ReadingTracker>({ readingData: [] });
  const [booksMetadata, setBooksMetadata] = useState<BooksMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableFactions, setAvailableFactions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFactions, setSelectedFactions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBooksMetadata(),
      fetchReadingTracker(),
      fetchFilters(),
    ]);
    setLoading(false);
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/filters');
      const data = await response.json();
      setAvailableTags(data.tags || []);
      setAvailableFactions(data.factions || []);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
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

  // Filter and sort books
  const filteredSeries = useMemo(() => {
    if (!booksMetadata) return [];

    const result = booksMetadata.series.map(series => {
      // Filter books within each series
      const filteredBooks = series.books.filter(book => {
        // Name search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = book.title.toLowerCase().includes(query) ||
                            book.author.toLowerCase().includes(query);
          if (!matchesName) return false;
        }

        // Tag filter
        if (selectedTags.length > 0) {
          const hasTag = selectedTags.some(tag => book.tags?.includes(tag));
          if (!hasTag) return false;
        }

        // Faction filter
        if (selectedFactions.length > 0) {
          const hasFaction = selectedFactions.some(faction => book.faction?.includes(faction));
          if (!hasFaction) return false;
        }

        return true;
      });

      return { ...series, books: filteredBooks };
    }).filter(series => series.books.length > 0); // Only show series with matching books

    // Sort series by name if requested
    if (sortBy === 'name-asc') {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      return [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [booksMetadata, searchQuery, selectedTags, selectedFactions, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleFaction = (faction: string) => {
    setSelectedFactions(prev =>
      prev.includes(faction) ? prev.filter(f => f !== faction) : [...prev, faction]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedFactions([]);
    setSortBy('default');
  };

  const activeFilterCount = (searchQuery ? 1 : 0) + selectedTags.length + selectedFactions.length + (sortBy !== 'default' ? 1 : 0);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Books by Series</h1>
          <p className="text-slate-400">
            Browse all Warhammer 40K books organized by series in Black Library publication order
          </p>
        </div>

        {/* Filters Section */}
        {!loading && booksMetadata && (
          <div className={`${styles.card} p-6 mb-8`}>
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${styles.textGold} hover:underline`}
              >
                <span className="text-xl">{showFilters ? '−' : '+'}</span>
                <span className="font-semibold">
                  Filters & Sorting {activeFilterCount > 0 && `(${activeFilterCount} active)`}
                </span>
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className={`text-sm ${styles.textSecondary} hover:${styles.textGold} transition-colors`}
                >
                  Clear All
                </button>
              )}
            </div>

            {showFilters && (
              <div className="space-y-6">
                {/* Search by Name */}
                <div>
                  <label className={`block text-sm font-semibold ${styles.textGold} mb-2`}>
                    Search by Title or Author
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search..."
                    className={`w-full px-4 py-2 ${styles.bgElevated} border border-slate-700 rounded focus:outline-none focus:border-[#D4AF37] ${styles.textPrimary}`}
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <label className={`block text-sm font-semibold ${styles.textGold} mb-2`}>
                    Sort Series
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className={`w-full px-4 py-2 ${styles.bgElevated} border border-slate-700 rounded focus:outline-none focus:border-[#D4AF37] ${styles.textPrimary}`}
                  >
                    <option value="default">Default Order</option>
                    <option value="name-asc">Series Name (A-Z)</option>
                    <option value="name-desc">Series Name (Z-A)</option>
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className={`block text-sm font-semibold ${styles.textGold} mb-2`}>
                    Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? `bg-[#D4AF37] text-slate-900 font-semibold`
                            : `${styles.bgElevated} ${styles.textSecondary} hover:${styles.textGold}`
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Factions Filter */}
                <div>
                  <label className={`block text-sm font-semibold ${styles.textGold} mb-2`}>
                    Filter by Factions {selectedFactions.length > 0 && `(${selectedFactions.length} selected)`}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableFactions.map(faction => (
                      <button
                        key={faction}
                        onClick={() => toggleFaction(faction)}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          selectedFactions.includes(faction)
                            ? `bg-[#D4AF37] text-slate-900 font-semibold`
                            : `${styles.bgElevated} ${styles.textSecondary} hover:${styles.textGold}`
                        }`}
                      >
                        {faction}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
            {/* Results Count */}
            {activeFilterCount > 0 && (
              <div className={`mb-4 ${styles.textSecondary} text-sm`}>
                Showing {filteredSeries.reduce((sum, s) => sum + s.books.length, 0)} books
                in {filteredSeries.length} {filteredSeries.length === 1 ? 'series' : 'series'}
              </div>
            )}

            {filteredSeries.length === 0 ? (
              <div className={`${styles.card} p-12 text-center`}>
                <p className={`${styles.textSecondary} text-lg mb-4`}>
                  No books match your filters
                </p>
                <button
                  onClick={clearFilters}
                  className={styles.btnPrimary}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredSeries.map((series) => (
                  <SeriesView
                    key={series.id}
                    series={series}
                    readingTracker={readingTracker}
                    onUpdateStatus={updateReadingStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
