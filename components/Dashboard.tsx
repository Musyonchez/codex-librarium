import { ReadingTracker, BooksMetadata } from '@/lib/types';
import { styles } from '@/lib/design-system';

interface DashboardProps {
  readingTracker: ReadingTracker;
  booksMetadata: BooksMetadata;
}

export default function Dashboard({ readingTracker, booksMetadata }: DashboardProps) {
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

      <div className={`${styles.card} p-6`}>
        <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>Series Progress</h2>
        <div className="space-y-4">
          {seriesProgress.map((series) => {
            const percent = series.total > 0 ? (series.completed / series.total) * 100 : 0;

            return (
              <div key={series.name} className={`${styles.bgMain} rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>{series.name}</h3>
                    <p className={`text-sm ${styles.textSecondary}`}>
                      {series.completed} / {series.total} books completed
                      {series.reading > 0 && ` • ${series.reading} in progress`}
                    </p>
                  </div>
                  <span className={`${styles.textGold} font-bold text-xl`}>{Math.round(percent)}%</span>
                </div>

                <div className={`h-2 ${styles.bgElevated} rounded-full overflow-hidden mb-2`}>
                  <div
                    className="h-full bg-[#D4AF37] transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {series.nextBook && (
                  <div className={`text-sm ${styles.textSecondary} mt-2`}>
                    Next to read: <span className={styles.textGold}>#{series.nextBook.orderInSeries} - {series.nextBook.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {stats.reading > 0 && readingTracker?.readingData && (
        <div className={`${styles.card} p-6`}>
          <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>Currently Reading</h2>
          <div className="space-y-2">
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
                  <div key={entry.bookId} className={`${styles.bgMain} rounded-lg p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>{book.title}</h3>
                        <p className={`text-sm ${styles.textSecondary}`}>
                          {series?.name} #{book.orderInSeries} • {book.author}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
