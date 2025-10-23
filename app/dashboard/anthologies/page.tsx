'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardTabs from '@/components/DashboardTabs';
import { styles } from '@/lib/design-system';

interface Anthology {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

interface ReadingProgress {
  anthology_id: string;
  status: 'unread' | 'reading' | 'completed';
  rating?: number;
  notes?: string;
}

export default function AnthologiesDashboardPage() {
  const [anthologies, setAnthologies] = useState<Anthology[]>([]);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReading, setShowReading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAnthologies(), fetchProgress()]);
    setLoading(false);
  };

  const fetchAnthologies = async () => {
    try {
      const response = await fetch('/api/anthologies');
      const data = await response.json();
      setAnthologies(data.anthologies || []);
    } catch (error) {
      console.error('Failed to fetch anthologies:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/reading/anthologies');
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
    total: anthologies.length,
    completed: progress.filter(p => p.status === 'completed').length,
    reading: progress.filter(p => p.status === 'reading').length,
    unread: anthologies.length - progress.length + progress.filter(p => p.status === 'unread').length,
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const getBooksByStatus = (status: 'reading' | 'completed') => {
    return progress
      .filter(p => p.status === status)
      .map(p => anthologies.find(a => a.id === p.anthology_id))
      .filter(Boolean) as Anthology[];
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
                <div className={`${styles.textSecondary} text-sm mb-2`}>Total Anthologies</div>
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
                You&apos;ve completed {stats.completed} out of {stats.total} anthologies
              </p>
            </div>

            {/* Currently Reading */}
            {readingBooks.length > 0 && (
              <div className={`${styles.card} overflow-hidden`}>
                <button
                  onClick={() => setShowReading(!showReading)}
                  className="w-full p-6 text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`${styles.textGold} text-2xl`}>{showReading ? '−' : '+'}</span>
                      <h2 className={`text-2xl font-bold ${styles.textGold}`}>Currently Reading</h2>
                      <span className={`text-lg ${styles.textSecondary}`}>({readingBooks.length})</span>
                    </div>
                  </div>
                </button>

                {showReading && (
                  <div className="px-6 pb-6 space-y-2">
                    {readingBooks.map((book) => (
                      <div key={book.id} className="bg-slate-800 rounded-lg p-4">
                        <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${styles.textSecondary}`}>{book.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Books */}
            {completedBooks.length > 0 && (
              <div className={`${styles.card} overflow-hidden`}>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full p-6 text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`${styles.textGold} text-2xl`}>{showCompleted ? '−' : '+'}</span>
                      <h2 className={`text-2xl font-bold ${styles.textGold}`}>Completed Books</h2>
                      <span className={`text-lg ${styles.textSecondary}`}>({completedBooks.length})</span>
                    </div>
                  </div>
                </button>

                {showCompleted && (
                  <div className="px-6 pb-6 space-y-2">
                    {completedBooks.map((book) => (
                      <div key={book.id} className="bg-slate-800 rounded-lg p-4">
                        <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${styles.textSecondary}`}>{book.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
