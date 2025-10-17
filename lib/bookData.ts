import booksMetadata from '@/data/books-metadata.json';
import readingTrackerData from '@/data/reading-tracker.json';
import { BooksMetadata, ReadingTracker, BookWithStatus, SeriesProgress, ReadingStatus } from './types';

export const metadata: BooksMetadata = booksMetadata;
export const readingTracker: ReadingTracker = readingTrackerData;

export function getReadingStatus(bookId: string): ReadingStatus {
  const entry = readingTracker.readingData.find(r => r.bookId === bookId);
  return entry?.status || 'unread';
}

export function getReadingEntry(bookId: string) {
  return readingTracker.readingData.find(r => r.bookId === bookId);
}

export function getBooksWithStatus(seriesId: string): BookWithStatus[] {
  const series = metadata.series.find(s => s.id === seriesId);
  if (!series) return [];

  return series.books.map(book => {
    const entry = getReadingEntry(book.id);
    return {
      ...book,
      readingStatus: entry?.status || 'unread',
      rating: entry?.rating,
      notes: entry?.notes,
      startedAt: entry?.startedAt,
      completedAt: entry?.completedAt,
    };
  });
}

export function getAllBooksWithStatus(): BookWithStatus[] {
  return metadata.series.flatMap(series => getBooksWithStatus(series.id));
}

export function getSeriesProgress(seriesId: string): SeriesProgress | null {
  const series = metadata.series.find(s => s.id === seriesId);
  if (!series) return null;

  const booksWithStatus = getBooksWithStatus(seriesId);
  const completedBooks = booksWithStatus.filter(b => b.readingStatus === 'completed').length;
  const currentlyReading = booksWithStatus.filter(b => b.readingStatus === 'reading').length;
  const totalBooks = booksWithStatus.length;

  // Find next book to read (first unread book in series order)
  const nextToRead = booksWithStatus
    .filter(b => b.readingStatus === 'unread')
    .sort((a, b) => a.orderInSeries - b.orderInSeries)[0];

  return {
    seriesId: series.id,
    seriesName: series.name,
    totalBooks,
    completedBooks,
    currentlyReading,
    percentComplete: totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0,
    nextToRead,
  };
}

export function getAllSeriesProgress(): SeriesProgress[] {
  return metadata.series
    .map(s => getSeriesProgress(s.id))
    .filter((p): p is SeriesProgress => p !== null);
}

export function getRecommendedNextBooks(limit: number = 3): BookWithStatus[] {
  const recommendations: BookWithStatus[] = [];

  // For each series, get the next unread book
  for (const series of metadata.series) {
    const progress = getSeriesProgress(series.id);
    if (progress?.nextToRead) {
      const bookWithStatus = getBooksWithStatus(series.id).find(
        b => b.id === progress.nextToRead?.id
      );
      if (bookWithStatus) {
        recommendations.push(bookWithStatus);
      }
    }
  }

  // Sort by series importance (Horus Heresy first, then Siege of Terra, etc.)
  const seriesOrder = ['horus-heresy', 'siege-of-terra', 'primarchs'];
  recommendations.sort((a, b) => {
    const aSeriesIndex = seriesOrder.indexOf(
      metadata.series.find(s => s.books.some(book => book.id === a.id))?.id || ''
    );
    const bSeriesIndex = seriesOrder.indexOf(
      metadata.series.find(s => s.books.some(book => book.id === b.id))?.id || ''
    );
    return aSeriesIndex - bSeriesIndex;
  });

  return recommendations.slice(0, limit);
}

export function getBooksByChronologicalOrder(): BookWithStatus[] {
  const allBooks = getAllBooksWithStatus();
  return allBooks
    .filter(book => book.chronologicalOrder !== undefined)
    .sort((a, b) => (a.chronologicalOrder || 0) - (b.chronologicalOrder || 0));
}

export function searchBooks(query: string): BookWithStatus[] {
  const searchTerm = query.toLowerCase();
  return getAllBooksWithStatus().filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm) ||
    book.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    book.legion?.some(legion => legion.toLowerCase().includes(searchTerm))
  );
}
