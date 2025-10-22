'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardTabs from '@/components/DashboardTabs';
import { styles } from '@/lib/design-system';

interface Single {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

interface ReadingProgress {
  single_id: string;
  status: 'unread' | 'reading' | 'completed';
  rating?: number;
  notes?: string;
}

export default function SinglesDashboardPage() {
  const [singles, setSingles] = useState<Single[]>([]);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSingles(), fetchProgress()]);
    setLoading(false);
  };

  const fetchSingles = async () => {
    try {
      const response = await fetch('/api/singles');
      const data = await response.json();
      setSingles(data.singles || []);
    } catch (error) {
      console.error('Failed to fetch singles:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/reading/singles');
      if (!response.ok) {
        setProgress([]);
        return;
      }
      const data = await response.json();
      setProgress(data.progress || []);
    } catch (error) {
      console.error('Failed to fetch reading progress:', error);
      setProgress([]);
    }
  };

  const stats = {
    total: singles.length,
    completed: progress.filter(p => p.status === 'completed').length,
    reading: progress.filter(p => p.status === 'reading').length,
    unread: singles.length - progress.length + progress.filter(p => p.status === 'unread').length,
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const getBooksByStatus = (status: 'reading' | 'completed') => {
    return progress
      .filter(p => p.status === status)
      .map(p => singles.find(s => s.id === p.single_id))
      .filter(Boolean) as Single[];
  };

  const readingBooks = getBooksByStatus('reading');
  const completedBooks = getBooksByStatus('completed');

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
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`${styles.card} p-6`}>
                <div className={`${styles.textSecondary} text-sm mb-2`}>Total Singles</div>
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

            {/* Progress Bar */}
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
                You&apos;ve completed {stats.completed} out of {stats.total} singles
              </p>
            </div>

            {/* Currently Reading */}
            {readingBooks.length > 0 && (
              <div className={`${styles.card} p-6`}>
                <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>
                  Currently Reading ({readingBooks.length})
                </h2>
                <div className="space-y-2">
                  {readingBooks.map((book) => (
                    <div key={book.id} className="bg-slate-800 rounded-lg p-4">
                      <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                        {book.title}
                      </h3>
                      <p className={`text-sm ${styles.textSecondary}`}>{book.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Books */}
            {completedBooks.length > 0 && (
              <div className={`${styles.card} p-6`}>
                <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>
                  Completed Books ({completedBooks.length})
                </h2>
                <div className="space-y-2">
                  {completedBooks.map((book) => (
                    <div key={book.id} className="bg-slate-800 rounded-lg p-4">
                      <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                        {book.title}
                      </h3>
                      <p className={`text-sm ${styles.textSecondary}`}>{book.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
