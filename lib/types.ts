export interface Book {
  id: string;
  title: string;
  author: string;
  orderInSeries: number;
  chronologicalOrder?: number;
  legion?: string[];
  tags?: string[];
}

export interface Series {
  id: string;
  name: string;
  description: string;
  books: Book[];
}

export interface BooksMetadata {
  series: Series[];
}

export type ReadingStatus = 'unread' | 'reading' | 'completed';

export interface ReadingEntry {
  bookId: string;
  status: ReadingStatus;
  rating?: number; // 1-5 stars
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ReadingTracker {
  readingData: ReadingEntry[];
}

export interface BookWithStatus extends Book {
  readingStatus: ReadingStatus;
  rating?: number;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SeriesProgress {
  seriesId: string;
  seriesName: string;
  totalBooks: number;
  completedBooks: number;
  currentlyReading: number;
  percentComplete: number;
  nextToRead?: Book;
}
