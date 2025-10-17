import { useState } from 'react';
import { ReadingTracker, BooksMetadata } from '@/lib/types';
import { styles } from '@/lib/design-system';

interface DashboardProps {
  readingTracker: ReadingTracker;
  booksMetadata: BooksMetadata;
}

export default function Dashboard({ readingTracker, booksMetadata }: DashboardProps) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [showSeriesProgress, setShowSeriesProgress] = useState(true);
  const [showReading, setShowReading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const stats = {
    total: 0,
    completed: 0,
    reading: 0,
    unread: 0,
  };

  const seriesProgress = booksMetadata.series.map((series) => {
    const seriesStats = {
      name: series.name,
      total: series.books.length,
      completed: 0,
      reading: 0,
      nextBook: null as { title: string; orderInSeries: number } | null,
    };

    series.books.forEach((book) => {
      stats.total++;
      const entry = readingTracker?.readingData?.find((r) => r.bookId === book.id);
      const status = entry?.status || 'unread';

      if (status === 'completed') {
        seriesStats.completed++;
        stats.completed++;
      } else if (status === 'reading') {
        seriesStats.reading++;
        stats.reading++;
      } else {
        stats.unread++;
      }
    });

    // Find next book to read
    const nextToRead = series.books
      .filter((book) => {
        const entry = readingTracker?.readingData?.find((r) => r.bookId === book.id);
        return !entry || entry.status === 'unread';
      })
      .sort((a, b) => a.orderInSeries - b.orderInSeries)[0];

    if (nextToRead) {
      seriesStats.nextBook = {
        title: nextToRead.title,
        orderInSeries: nextToRead.orderInSeries,
      };
    }

    return seriesStats;
  });

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${styles.card} p-6`}>
          <div className={`${styles.textSecondary} text-sm mb-2`}>Total Books</div>
          <div className={`text-4xl font-bold ${styles.textGold}`}>{stats.total}</div>
        </div>

        <div className={`${styles.card} p-6`}>
          <div className={`${styles.textSecondary} text-sm mb-2`}>Completed</div>
          <div className={`text-4xl font-bold ${styles.textGold}`}>{stats.completed}</div>
        </div>

        <div className={`${styles.card} p-6`}>
          <div className={`${styles.textSecondary} text-sm mb-2`}>Currently Reading</div>
          <div className={`text-4xl font-bold ${styles.textGold}`}>{stats.reading}</div>
        </div>

        <div className={`${styles.card} p-6`}>
          <div className={`${styles.textSecondary} text-sm mb-2`}>Unread</div>
          <div className={`text-4xl font-bold ${styles.textSecondary}`}>{stats.unread}</div>
        </div>
      </div>

      <div className={`${styles.card} p-6`}>
        <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>Overall Progress</h2>
        <div className="flex items-center gap-4">
          <div className={`flex-1 h-4 ${styles.bgElevated} rounded-full overflow-hidden`}>
            <div
              className="h-full bg-[#D4AF37] transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className={`text-2xl font-bold ${styles.textGold} min-w-[80px] text-right`}>
            {Math.round(completionRate)}%
          </span>
        </div>
        <p className={`${styles.textSecondary} mt-2 text-sm`}>
          You&apos;ve completed {stats.completed} out of {stats.total} books in your collection
        </p>
      </div>

      <div className={`${styles.card} overflow-hidden`}>
        <button
          onClick={() => setShowSeriesProgress(!showSeriesProgress)}
          className="w-full p-6 text-left hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`${styles.textGold} text-2xl`}>{showSeriesProgress ? '−' : '+'}</span>
              <h2 className={`text-2xl font-bold ${styles.textGold}`}>Series Progress</h2>
              <span className={`text-lg ${styles.textSecondary}`}>({seriesProgress.length} series)</span>
            </div>
          </div>
        </button>

        {showSeriesProgress && (
          <div className="px-6 pb-6 space-y-3">
            {seriesProgress.map((seriesData) => {
            const percent = seriesData.total > 0 ? (seriesData.completed / seriesData.total) * 100 : 0;
            const isExpanded = expandedSeries === seriesData.name;

            // Get books from this series
            const series = booksMetadata.series.find(s => s.name === seriesData.name);
            const completedBooks = series?.books.filter(book => {
              const entry = readingTracker?.readingData?.find(r => r.bookId === book.id);
              return entry?.status === 'completed';
            }) || [];

            return (
              <div key={seriesData.name} className={`${styles.bgMain} rounded-lg overflow-hidden`}>
                <button
                  onClick={() => setExpandedSeries(isExpanded ? null : seriesData.name)}
                  className="w-full p-4 text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`${styles.textGold} text-lg`}>{isExpanded ? '−' : '+'}</span>
                        <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>{seriesData.name}</h3>
                      </div>
                      <p className={`text-sm ${styles.textSecondary} ml-7`}>
                        {seriesData.completed} / {seriesData.total} books completed
                        {seriesData.reading > 0 && ` • ${seriesData.reading} in progress`}
                      </p>
                    </div>
                    <span className={`${styles.textGold} font-bold text-xl`}>{Math.round(percent)}%</span>
                  </div>

                  <div className={`h-2 ${styles.bgElevated} rounded-full overflow-hidden ml-7`}>
                    <div
                      className="h-full bg-[#D4AF37] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {seriesData.nextBook && (
                    <div className={`text-sm ${styles.textSecondary} mt-2 ml-7`}>
                      Next to read: <span className={styles.textGold}>#{seriesData.nextBook.orderInSeries} - {seriesData.nextBook.title}</span>
                    </div>
                  )}
                </button>

                {isExpanded && completedBooks.length > 0 && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className={`text-sm font-semibold ${styles.textSecondary} ml-7 mb-2`}>
                      Completed Books:
                    </div>
                    {completedBooks.map((book) => (
                      <div key={book.id} className="bg-slate-800 rounded p-3 ml-7">
                        <div className="flex items-baseline gap-2">
                          <span className={`${styles.textGold} font-mono text-sm`}>#{book.orderInSeries}</span>
                          <h4 className={`font-medium ${styles.textPrimary}`}>{book.title}</h4>
                        </div>
                        <p className={`text-sm ${styles.textSecondary} mt-1`}>{book.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {stats.reading > 0 && readingTracker?.readingData && (
        <div className={`${styles.card} overflow-hidden`}>
          <button
            onClick={() => setShowReading(!showReading)}
            className="w-full p-6 text-left hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`${styles.textGold} text-2xl`}>{showReading ? '−' : '+'}</span>
                <h2 className={`text-2xl font-bold ${styles.textGold}`}>Currently Reading</h2>
                <span className={`text-lg ${styles.textSecondary}`}>({stats.reading})</span>
              </div>
            </div>
          </button>

          {showReading && (
            <div className="px-6 pb-6 space-y-2">
              {readingTracker.readingData
                .filter((entry) => entry.status === 'reading')
                .map((entry) => {
                  const book = booksMetadata.series
                    .flatMap((s) => s.books)
                    .find((b) => b.id === entry.bookId);

                  if (!book) return null;

                  const series = booksMetadata.series.find((s) =>
                    s.books.some((b) => b.id === book.id)
                  );

                  return (
                    <div key={entry.bookId} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`${styles.textGold} font-mono text-sm`}>#{book.orderInSeries}</span>
                        <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>{book.title}</h3>
                      </div>
                      <p className={`text-sm ${styles.textSecondary}`}>
                        {series?.name} • {book.author}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {stats.completed > 0 && readingTracker?.readingData && (
        <div className={`${styles.card} overflow-hidden`}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full p-6 text-left hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`${styles.textGold} text-2xl`}>{showCompleted ? '−' : '+'}</span>
                <h2 className={`text-2xl font-bold ${styles.textGold}`}>Completed Books</h2>
                <span className={`text-lg ${styles.textSecondary}`}>({stats.completed})</span>
              </div>
            </div>
          </button>

          {showCompleted && (
            <div className="px-6 pb-6 space-y-2">
              {readingTracker.readingData
                .filter((entry) => entry.status === 'completed')
                .map((entry) => {
                  const book = booksMetadata.series
                    .flatMap((s) => s.books)
                    .find((b) => b.id === entry.bookId);

                  if (!book) return null;

                  const series = booksMetadata.series.find((s) =>
                    s.books.some((b) => b.id === book.id)
                  );

                  return (
                    <div key={entry.bookId} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`${styles.textGold} font-mono text-sm`}>#{book.orderInSeries}</span>
                        <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>{book.title}</h3>
                      </div>
                      <p className={`text-sm ${styles.textSecondary}`}>
                        {series?.name} • {book.author}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
