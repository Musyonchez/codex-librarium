'use client';

import { Book, ReadingStatus } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';

interface BookDetailsModalProps {
  book: Omit<Book, 'orderInSeries'> & { orderInSeries?: number; seriesName?: string };
  currentStatus: ReadingStatus;
  onClose: () => void;
  onStatusChange: (status: ReadingStatus) => void;
}

export default function BookDetailsModal({
  book,
  currentStatus,
  onClose,
  onStatusChange,
}: BookDetailsModalProps) {
  const statuses: ReadingStatus[] = ['unread', 'reading', 'completed'];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${styles.card} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-3 mb-2">
                {book.seriesName && (
                  <span className={`text-sm ${styles.textSecondary}`}>
                    {book.seriesName}
                  </span>
                )}
                {book.orderInSeries !== undefined && (
                  <span className={`text-sm ${styles.textGold} font-mono`}>
                    #{book.orderInSeries}
                  </span>
                )}
              </div>
              <h2 className={`text-3xl font-bold ${styles.textGold} mb-2`}>
                {book.title}
              </h2>
              <p className={`text-lg ${styles.textSecondary}`}>
                by {book.author}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`flex-shrink-0 ${styles.textSecondary} hover:${styles.textGold} text-2xl transition-colors`}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Status */}
            <div>
              <h3 className={`text-sm font-semibold ${styles.textGold} mb-3`}>
                READING STATUS
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{statusIcons[currentStatus]}</span>
                <span className={`text-xl ${styles.textPrimary}`}>
                  {statusLabels[currentStatus]}
                </span>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div>
              <h3 className={`text-sm font-semibold ${styles.textGold} mb-3`}>
                CHANGE STATUS
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentStatus === status
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-700/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{statusIcons[status]}</div>
                    <div
                      className={`text-sm font-medium ${
                        currentStatus === status ? styles.textGold : styles.textSecondary
                      }`}
                    >
                      {statusLabels[status]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Factions */}
            {book.faction && book.faction.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold ${styles.textGold} mb-3`}>
                  FACTIONS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {book.faction.map((faction) => (
                    <span
                      key={faction}
                      className={`px-3 py-1.5 ${styles.bgElevated} rounded text-sm ${styles.textPrimary}`}
                    >
                      {faction}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold ${styles.textGold} mb-3`}>
                  TAGS & THEMES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1.5 ${styles.bgMain} border border-slate-700 rounded text-sm ${styles.textSecondary}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Book Details */}
            <div className="pt-4 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${styles.textMuted} block mb-1`}>Book ID</span>
                  <span className={`${styles.textPrimary} font-mono`}>{book.id}</span>
                </div>
                {book.orderInSeries !== undefined && (
                  <div>
                    <span className={`${styles.textMuted} block mb-1`}>Order in Series</span>
                    <span className={styles.textPrimary}>#{book.orderInSeries}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-50 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
