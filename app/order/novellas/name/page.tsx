'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import BookDetailsModal from '@/components/BookDetailsModal';
import { ReadingStatus } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';
import { toast } from 'sonner';

interface Novella {
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

export default function NovellasByNamePage() {
  const [novellas, setNovellas] = useState<Novella[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [selectedNovella, setSelectedNovella] = useState<Novella | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchNovellas(), fetchReadingProgress()]);
    setLoading(false);
  };

  const fetchNovellas = async () => {
    try {
      const response = await fetch('/api/novellas');
      const data = await response.json();
      setNovellas(data.novellas || []);
    } catch (error) {
      console.error('Failed to fetch novellas:', error);
    }
  };

  const fetchReadingProgress = async () => {
    try {
      const response = await fetch('/api/reading/novellas');
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
      const response = await fetch('/api/reading/novellas', {
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
    setSelectedNovella(null);

    toast.success(`${bookTitle}`, {
      description: `Marked as ${statusLabels[status]}`,
    });
  };

  // Sort alphabetically
  const sortedNovellas = useMemo(() => {
    return [...novellas].sort((a, b) => a.title.localeCompare(b.title));
  }, [novellas]);

  // Filter by search query
  const filteredNovellas = useMemo(() => {
    if (!searchQuery) return sortedNovellas;

    const query = searchQuery.toLowerCase();
    return sortedNovellas.filter(
      (novella) =>
        novella.title.toLowerCase().includes(query) ||
        novella.author.toLowerCase().includes(query)
    );
  }, [sortedNovellas, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredNovellas.length / itemsPerPage);
  const paginatedNovellas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNovellas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNovellas, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Novellas by Name</h1>
          <p className="text-slate-400">
            Warhammer 40K novellas in alphabetical order
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
              Showing {paginatedNovellas.length} of {filteredNovellas.length} {filteredNovellas.length === 1 ? 'novella' : 'novellas'}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>

            {/* Novellas List */}
            {filteredNovellas.length === 0 ? (
              <div className={`${styles.card} p-12 text-center`}>
                <p className={`${styles.textSecondary} text-lg`}>
                  No novellas found matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  {paginatedNovellas.map((novella) => {
                    const status = getStatus(novella.id);
                    const statusIcon = statusIcons[status];

                    return (
                      <div
                        key={novella.id}
                        className={styles.bookCard}
                        onClick={() => setSelectedNovella(novella)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 text-center">
                            <span className={`text-2xl ${styles.textGold}`}>{statusIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                              {novella.title}
                            </h3>
                            <div className={`flex flex-wrap gap-3 text-sm ${styles.textSecondary}`}>
                              <span>by {novella.author}</span>
                              {novella.faction && novella.faction.length > 0 && (
                                <span className={styles.textMuted}>
                                  • {novella.faction.join(', ')}
                                </span>
                              )}
                            </div>
                            {novella.tags && novella.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {novella.tags.map((tag) => (
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
        {selectedNovella && (
          <BookDetailsModal
            book={selectedNovella}
            currentStatus={getStatus(selectedNovella.id)}
            onClose={() => setSelectedNovella(null)}
            onStatusChange={(status) => handleStatusChange(selectedNovella.id, selectedNovella.title, status)}
          />
        )}
      </div>
    </AppLayout>
  );
}
