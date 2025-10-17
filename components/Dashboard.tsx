import { ReadingTracker, BooksMetadata } from '@/lib/types';

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
        <div className="bg-slate-800/50 rounded-lg p-6 border border-amber-600/20">
          <div className="text-slate-400 text-sm mb-2">Total Books</div>
          <div className="text-4xl font-bold text-amber-400">{stats.total}</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-green-600/20">
          <div className="text-slate-400 text-sm mb-2">Completed</div>
          <div className="text-4xl font-bold text-green-400">{stats.completed}</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-600/20">
          <div className="text-slate-400 text-sm mb-2">Currently Reading</div>
          <div className="text-4xl font-bold text-blue-400">{stats.reading}</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/20">
          <div className="text-slate-400 text-sm mb-2">Unread</div>
          <div className="text-4xl font-bold text-slate-400">{stats.unread}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-amber-600/20">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Overall Progress</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-amber-400 min-w-[80px] text-right">
            {Math.round(completionRate)}%
          </span>
        </div>
        <p className="text-slate-400 mt-2 text-sm">
          You&apos;ve completed {stats.completed} out of {stats.total} books in your collection
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-amber-600/20">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Series Progress</h2>
        <div className="space-y-4">
          {seriesProgress.map((series) => {
            const percent = series.total > 0 ? (series.completed / series.total) * 100 : 0;

            return (
              <div key={series.name} className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{series.name}</h3>
                    <p className="text-sm text-slate-400">
                      {series.completed} / {series.total} books completed
                      {series.reading > 0 && ` • ${series.reading} in progress`}
                    </p>
                  </div>
                  <span className="text-amber-400 font-bold text-xl">{Math.round(percent)}%</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {series.nextBook && (
                  <div className="text-sm text-slate-400 mt-2">
                    Next to read: <span className="text-amber-300">#{series.nextBook.orderInSeries} - {series.nextBook.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {stats.reading > 0 && readingTracker?.readingData && (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-600/20">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Currently Reading</h2>
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
                  <div key={entry.bookId} className="bg-slate-900/30 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{book.title}</h3>
                        <p className="text-sm text-slate-400">
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
