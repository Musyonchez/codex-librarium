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

export default function SinglesByNamePage() {
  const [singles, setSingles] = useState<Single[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [selectedSingle, setSelectedSingle] = useState<Single | null>(null);
  const itemsPerPage = 20;

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
                  {paginatedSingles.map((single) => {
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
                              {single.faction && single.faction.length > 0 && (
                                <span className={styles.textMuted}>
                                  • {single.faction.join(', ')}
                                </span>
                              )}
                            </div>
                            {single.tags && single.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
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
                          <div className={`flex-shrink-0 text-xs ${styles.textMuted} uppercase tracking-wider`}>
                            {statusLabels[status]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
