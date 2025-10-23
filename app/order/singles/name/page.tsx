'use client';

import { useState, useEffect, useMemo } from 'react';
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

export default function SinglesByNamePage() {
  const [singles, setSingles] = useState<Single[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Sort alphabetically
  const sortedSingles = useMemo(() => {
    return [...singles].sort((a, b) => a.title.localeCompare(b.title));
  }, [singles]);

  // Filter by search query
  const filteredSingles = useMemo(() => {
    if (!searchQuery) return sortedSingles;

    const query = searchQuery.toLowerCase();
    return sortedSingles.filter(
      (single) =>
        single.title.toLowerCase().includes(query) ||
        single.author.toLowerCase().includes(query)
    );
  }, [sortedSingles, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredSingles.length / itemsPerPage);
  const paginatedSingles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSingles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSingles, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Singles by Name</h1>
          <p className="text-slate-400">
            Standalone Warhammer 40K novels in alphabetical order
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
              Showing {paginatedSingles.length} of {filteredSingles.length} {filteredSingles.length === 1 ? 'novel' : 'novels'}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>

            {/* Singles List */}
            {filteredSingles.length === 0 ? (
              <div className={`${styles.card} p-12 text-center`}>
                <p className={`${styles.textSecondary} text-lg`}>
                  No novels found matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  {paginatedSingles.map((single) => (
                  <div
                    key={single.id}
                    className={`${styles.card} p-6 hover:${styles.bgElevated} transition-colors cursor-pointer`}
                  >
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
                      <div className="flex flex-wrap gap-2">
                        {single.tags.map((tag) => (
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${
                        currentPage === 1
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : `${styles.bgElevated} ${styles.textGold} hover:bg-slate-700`
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded ${
                            currentPage === page
                              ? 'bg-[#D4AF37] text-slate-900 font-bold'
                              : `${styles.bgElevated} ${styles.textSecondary} hover:${styles.textGold}`
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded ${
                        currentPage === totalPages
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : `${styles.bgElevated} ${styles.textGold} hover:bg-slate-700`
                      }`}
                    >
                      Next
                    </button>
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
