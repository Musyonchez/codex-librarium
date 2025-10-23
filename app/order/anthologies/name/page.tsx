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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Pagination
  const totalPages = Math.ceil(filteredAnthologies.length / itemsPerPage);
  const paginatedAnthologies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAnthologies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAnthologies, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
              Showing {paginatedAnthologies.length} of {filteredAnthologies.length} {filteredAnthologies.length === 1 ? 'anthology' : 'anthologies'}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>

            {/* Anthologies List */}
            {filteredAnthologies.length === 0 ? (
              <div className={`${styles.card} p-12 text-center`}>
                <p className={`${styles.textSecondary} text-lg`}>
                  No anthologies found matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  {paginatedAnthologies.map((anthology) => (
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
