'use client';

import { useState, useEffect } from 'react';
import SeriesView from '@/components/SeriesView';
import Dashboard from '@/components/Dashboard';
import { ReadingTracker, BooksMetadata } from '@/lib/types';

export default function Home() {
  const [readingTracker, setReadingTracker] = useState<ReadingTracker>({ readingData: [] });
  const [booksMetadata, setBooksMetadata] = useState<BooksMetadata | null>(null);
  const [activeView, setActiveView] = useState<'series' | 'timeline' | 'dashboard'>('series');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBooksMetadata(), fetchReadingTracker()]);
    setLoading(false);
  };

  const fetchBooksMetadata = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooksMetadata(data);
    } catch (error) {
      console.error('Failed to fetch books metadata:', error);
    }
  };

  const fetchReadingTracker = async () => {
    try {
      const response = await fetch('/api/reading');
      if (!response.ok) {
        // User not authenticated or other error - use empty tracker
        console.log('Not authenticated or error fetching reading tracker');
        setReadingTracker({ readingData: [] });
        return;
      }
      const data = await response.json();
      setReadingTracker(data);
    } catch (error) {
      console.error('Failed to fetch reading tracker:', error);
      setReadingTracker({ readingData: [] });
    }
  };

  const updateReadingStatus = async (bookId: string, status: 'unread' | 'reading' | 'completed') => {
    try {
      await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, status }),
      });
      await fetchReadingTracker();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/80 border-b border-amber-600/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">
            Warhammer 40K Reading Tracker
          </h1>
          <p className="text-slate-300">Track your journey through the grim darkness of the far future</p>

          <nav className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveView('series')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'series'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              By Series
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'timeline'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-amber-500 text-xl">Loading...</div>
          </div>
        ) : !booksMetadata ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-xl">Failed to load books. Please refresh.</div>
          </div>
        ) : (
          <>
            {activeView === 'series' && (
              <div className="space-y-8">
                {booksMetadata.series.map((series) => (
                  <SeriesView
                    key={series.id}
                    series={series}
                    readingTracker={readingTracker}
                    onUpdateStatus={updateReadingStatus}
                  />
                ))}
              </div>
            )}

            {activeView === 'timeline' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-4">Chronological Timeline</h2>
                <p className="text-slate-400">Timeline view coming soon...</p>
              </div>
            )}

            {activeView === 'dashboard' && (
              <Dashboard readingTracker={readingTracker} booksMetadata={booksMetadata} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
