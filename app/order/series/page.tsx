'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import SeriesView from '@/components/SeriesView';
import OrderTabs from '@/components/OrderTabs';
import { ReadingTracker, BooksMetadata, ReadingStatus } from '@/lib/types';

export default function OrderBySeriesPage() {
  const [readingTracker, setReadingTracker] = useState<ReadingTracker>({ readingData: [] });
  const [booksMetadata, setBooksMetadata] = useState<BooksMetadata | null>(null);
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

  const updateReadingStatus = async (bookId: string, status: ReadingStatus) => {
    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, status }),
      });

      if (!response.ok) {
        console.error('Failed to update status - not authenticated?');
        return;
      }

      await fetchReadingTracker();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Series Books</h1>
          <p className="text-slate-400">
            Browse all Warhammer 40K books organized by series in Black Library publication order
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : !booksMetadata ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-xl">Failed to load books. Please refresh.</div>
          </div>
        ) : (
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
      </div>
    </AppLayout>
  );
}
