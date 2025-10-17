'use client';

import { useState } from 'react';
import { Series, ReadingTracker, ReadingStatus } from '@/lib/types';

interface SeriesViewProps {
  series: Series;
  readingTracker: ReadingTracker;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
}

export default function SeriesView({ series, readingTracker, onUpdateStatus }: SeriesViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getStatusColor = (bookId: string) => {
    const entry = readingTracker?.readingData?.find(r => r.bookId === bookId);
    if (!entry || entry.status === 'unread') return 'bg-slate-700 hover:bg-slate-600';
    if (entry.status === 'reading') return 'bg-blue-600 hover:bg-blue-500';
    if (entry.status === 'completed') return 'bg-green-600 hover:bg-green-500';
    return 'bg-slate-700 hover:bg-slate-600';
  };

  const getStatus = (bookId: string): ReadingStatus => {
    const entry = readingTracker?.readingData?.find(r => r.bookId === bookId);
    return entry?.status || 'unread';
  };

  const cycleStatus = (bookId: string) => {
    const currentStatus = getStatus(bookId);
    const statusOrder: ReadingStatus[] = ['unread', 'reading', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onUpdateStatus(bookId, nextStatus);
  };

  const completedCount = series.books.filter(
    book => getStatus(book.id) === 'completed'
  ).length;
  const progressPercent = (completedCount / series.books.length) * 100;

  return (
    <div className="bg-slate-800/50 rounded-lg border border-amber-600/20 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">{series.name}</h2>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="text-slate-300">
                {completedCount} / {series.books.length} books
              </span>
              <div className="flex-1 max-w-xs h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-amber-400 font-semibold">{Math.round(progressPercent)}%</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-amber-400 text-2xl">
            {isExpanded ? '−' : '+'}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <p className="text-slate-400 mb-4">{series.description}</p>
          <div className="grid gap-2">
        {series.books.map((book) => {
          const status = getStatus(book.id);
          const statusIcon = {
            unread: '○',
            reading: '◐',
            completed: '●',
          }[status];

          return (
            <div
              key={book.id}
              className={`${getStatusColor(book.id)} rounded-lg p-4 transition-all cursor-pointer`}
              onClick={() => cycleStatus(book.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-2xl">{statusIcon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-amber-300 font-mono text-sm">#{book.orderInSeries}</span>
                    <h3 className="text-lg font-semibold text-white">{book.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                    <span>by {book.author}</span>
                    {book.legion && book.legion.length > 0 && (
                      <span className="text-slate-400">
                        • {book.legion.join(', ')}
                      </span>
                    )}
                  </div>
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {book.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-900/50 rounded text-xs text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-slate-400 uppercase tracking-wider">
                  {status}
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
