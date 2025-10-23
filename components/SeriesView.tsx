'use client';

import { useState } from 'react';
import { Series, ReadingTracker, ReadingStatus, Book } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';
import { toast } from 'sonner';
import BookDetailsModal from './BookDetailsModal';

interface SeriesViewProps {
  series: Series;
  readingTracker: ReadingTracker;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
}

export default function SeriesView({ series, readingTracker, onUpdateStatus }: SeriesViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBook, setSelectedBook] = useState<(Book & { seriesName: string }) | null>(null);

  const getStatus = (bookId: string): ReadingStatus => {
    const entry = readingTracker?.readingData?.find(r => r.bookId === bookId);
    return entry?.status || 'unread';
  };

  const handleStatusChange = (bookId: string, bookTitle: string, status: ReadingStatus) => {
    onUpdateStatus(bookId, status);
    setSelectedBook(null);

    // Show toast notification
    toast.success(`${bookTitle}`, {
      description: `Marked as ${statusLabels[status]}`,
    });
  };

  const completedCount = series.books.filter(
    book => getStatus(book.id) === 'completed'
  ).length;
  const progressPercent = series.books.length > 0
    ? (completedCount / series.books.length) * 100
    : 0;

  return (
    <div className={`${styles.card} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-6 text-left hover:${styles.bgElevated} transition-colors`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className={`text-2xl font-bold ${styles.textGold} mb-2`}>{series.name}</h2>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className={styles.textSecondary}>
                {completedCount} / {series.books.length} books
              </span>
              <div className={`flex-1 max-w-xs h-2 ${styles.bgElevated} rounded-full overflow-hidden`}>
                <div
                  className="h-full bg-[#D4AF37] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={`${styles.textGold} font-semibold`}>{Math.round(progressPercent)}%</span>
            </div>
          </div>
          <div className={`flex-shrink-0 ${styles.textGold} text-2xl`}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <p className={`${styles.textSecondary} mb-4`}>{series.description}</p>
          <div className="grid gap-2">
        {series.books.map((book) => {
          const status = getStatus(book.id);
          const statusIcon = statusIcons[status];

          return (
            <div
              key={book.id}
              className={styles.bookCard}
              onClick={() => setSelectedBook({ ...book, seriesName: series.name })}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 text-center">
                  <span className={`text-2xl ${styles.textGold}`}>{statusIcon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className={`${styles.textGold} font-mono text-sm`}>#{book.orderInSeries}</span>
                    <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>{book.title}</h3>
                  </div>
                  <div className={`flex flex-wrap gap-3 text-sm ${styles.textSecondary}`}>
                    <span>by {book.author}</span>
                    {book.faction && book.faction.length > 0 && (
                      <span className={styles.textMuted}>
                        • {book.faction.join(', ')}
                      </span>
                    )}
                  </div>
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {book.tags.map((tag) => (
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
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          currentStatus={getStatus(selectedBook.id)}
          onClose={() => setSelectedBook(null)}
          onStatusChange={(status) => handleStatusChange(selectedBook.id, selectedBook.title, status)}
        />
      )}
    </div>
  );
}
