'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/components/Dashboard';
import DashboardTabs from '@/components/DashboardTabs';
import { ReadingTracker, BooksMetadata } from '@/lib/types';

export default function DashboardPage() {
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

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Reading Dashboard</h1>
          <p className="text-slate-400">
            Track your progress and see statistics about your reading journey
          </p>
        </div>

        <DashboardTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : !booksMetadata ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-xl">Failed to load data. Please refresh.</div>
          </div>
        ) : (
          <Dashboard readingTracker={readingTracker} booksMetadata={booksMetadata} />
        )}
      </div>
    </AppLayout>
  );
}
