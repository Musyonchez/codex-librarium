export interface Book {
  id: string;
  title: string;
  author: string;
  orderInSeries: number;
  chronologicalOrder?: number;
  faction?: string[];
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

// Supabase reading_progress table type
export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
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
