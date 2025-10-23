'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import OrderTabs from '@/components/OrderTabs';
import BookDetailsModal from '@/components/BookDetailsModal';
import { ReadingStatus } from '@/lib/types';
import { styles, statusIcons, statusLabels } from '@/lib/design-system';
import { toast } from 'sonner';

interface Anthology {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
}

interface ReadingProgress {
  book_id: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
}

export default function AnthologiesByTagsPage() {
  const [anthologies, setAnthologies] = useState<Anthology[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedAnthology, setSelectedAnthology] = useState<Anthology | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAnthologies(), fetchReadingProgress()]);
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

  const fetchReadingProgress = async () => {
    try {
      const response = await fetch('/api/reading/anthologies');
      if (!response.ok) {
        setReadingProgress([]);
        return;
      }
      const data = await response.json();
      setReadingProgress(data.progress || []);
    } catch (error) {
      console.error('Failed to fetch reading progress:', error);
      setReadingProgress([]);
    }
  };

  const updateReadingStatus = async (bookId: string, status: ReadingStatus) => {
    try {
      const response = await fetch('/api/reading/anthologies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, status }),
      });

      if (!response.ok) {
        console.error('Failed to update status');
        return;
      }

      await fetchReadingProgress();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatus = (bookId: string): ReadingStatus => {
    const entry = readingProgress.find(r => r.book_id === bookId);
    return entry?.status || 'unread';
  };

  const handleStatusChange = (bookId: string, bookTitle: string, status: ReadingStatus) => {
    updateReadingStatus(bookId, status);
    setSelectedAnthology(null);

    toast.success(`${bookTitle}`, {
      description: `Marked as ${statusLabels[status]}`,
    });
  };

  // Group anthologies by tags
  const anthologiesByTag = useMemo(() => {
    const tagMap = new Map<string, Anthology[]>();

    anthologies.forEach((anthology) => {
      if (anthology.tags && anthology.tags.length > 0) {
        anthology.tags.forEach((tag) => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, []);
          }
          tagMap.get(tag)!.push(anthology);
        });
      }
    });

    // Sort tags alphabetically
    const sortedTags = new Map(
      Array.from(tagMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );

    return sortedTags;
  }, [anthologies]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery) return Array.from(anthologiesByTag.keys());

    const query = searchQuery.toLowerCase();
    return Array.from(anthologiesByTag.keys()).filter((tag) =>
      tag.toLowerCase().includes(query)
    );
  }, [anthologiesByTag, searchQuery]);

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Anthologies by Tags</h1>
          <p className="text-slate-400">
            Browse anthologies grouped by tags - click a tag to see all books with that tag
          </p>
        </div>

        <OrderTabs />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className={`${styles.card} p-4 mb-6`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className={`w-full px-4 py-2 ${styles.bgElevated} border border-slate-700 rounded focus:outline-none focus:border-[#D4AF37] ${styles.textPrimary}`}
              />
            </div>

            {/* Tag Selection */}
            {selectedTag ? (
              <div className="mb-6">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`text-sm ${styles.textSecondary} hover:${styles.textGold} mb-4`}
                >
                  ← Back to all tags
                </button>

                <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>
                  {selectedTag} ({anthologiesByTag.get(selectedTag)?.length || 0} books)
                </h2>

                <div className="grid gap-2">
                  {anthologiesByTag.get(selectedTag)?.map((anthology) => {
                    const status = getStatus(anthology.id);
                    const statusIcon = statusIcons[status];

                    return (
                      <div
                        key={anthology.id}
                        className={styles.bookCard}
                        onClick={() => setSelectedAnthology(anthology)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 text-center">
                            <span className={`text-2xl ${styles.textGold}`}>{statusIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-1`}>
                              {anthology.title}
                            </h3>
                            <div className={`flex flex-wrap gap-3 text-sm ${styles.textSecondary}`}>
                              <span>by {anthology.author}</span>
                              {anthology.faction && anthology.faction.length > 0 && (
                                <span className={styles.textMuted}>
                                  • {anthology.faction.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`flex-shrink-0 text-xs ${styles.textMuted} uppercase tracking-wider`}>
                            {statusLabels[status]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className={`mb-4 ${styles.textSecondary} text-sm`}>
                  {filteredTags.length} {filteredTags.length === 1 ? 'tag' : 'tags'} available
                </div>

                {filteredTags.length === 0 ? (
                  <div className={`${styles.card} p-12 text-center`}>
                    <p className={`${styles.textSecondary} text-lg`}>
                      No tags found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {filteredTags.map((tag) => {
                      const count = anthologiesByTag.get(tag)?.length || 0;
                      return (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`px-4 py-2 ${styles.bgElevated} ${styles.textSecondary} hover:${styles.textGold} hover:bg-slate-700 rounded transition-colors text-left`}
                        >
                          <div className="font-semibold">{tag}</div>
                          <div className="text-xs">{count} {count === 1 ? 'book' : 'books'}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Book Details Modal */}
        {selectedAnthology && (
          <BookDetailsModal
            book={selectedAnthology}
            currentStatus={getStatus(selectedAnthology.id)}
            onClose={() => setSelectedAnthology(null)}
            onStatusChange={(status) => handleStatusChange(selectedAnthology.id, selectedAnthology.title, status)}
          />
        )}
      </div>
    </AppLayout>
  );
}
