'use client';

import { useState, useEffect } from 'react';
import { metadata } from '@/lib/bookData';
import SeriesView from '@/components/SeriesView';
import Dashboard from '@/components/Dashboard';
import { ReadingTracker } from '@/lib/types';

export default function Home() {
  const [readingTracker, setReadingTracker] = useState<ReadingTracker>({ readingData: [] });
  const [activeView, setActiveView] = useState<'series' | 'timeline' | 'dashboard'>('series');

  useEffect(() => {
    fetchReadingTracker();
  }, []);

  const fetchReadingTracker = async () => {
    try {
      const response = await fetch('/api/reading');
      const data = await response.json();
      setReadingTracker(data);
    } catch (error) {
      console.error('Failed to fetch reading tracker:', error);
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
        {activeView === 'series' && (
          <div className="space-y-8">
            {metadata.series.map((series) => (
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
          <Dashboard readingTracker={readingTracker} />
        )}
      </main>
    </div>
  );
}
