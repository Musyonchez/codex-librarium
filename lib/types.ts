export interface Book {
  id: string;
  title: string;
  author: string;
  orderInSeries: number;
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

// Standalone book types (Singles, Novellas, Anthologies)
export interface Single {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
  created_at?: string;
}

export interface Novella {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
  created_at?: string;
}

export interface Anthology {
  id: string;
  title: string;
  author: string;
  faction: string[];
  tags: string[];
  created_at?: string;
}

// Reading progress types for standalone books
export interface SingleReadingProgress {
  id: string;
  user_id: string;
  single_id: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NovellaReadingProgress {
  id: string;
  user_id: string;
  novella_id: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AnthologyReadingProgress {
  id: string;
  user_id: string;
  anthology_id: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Book Requests
export type BookRequestStatus = 'pending' | 'waitlist' | 'approved' | 'refused';
export type BookRequestType = 'single' | 'novella' | 'anthology' | 'series' | 'other';

export interface BookRequest {
  id: string;
  title: string;
  author: string;
  book_type: BookRequestType;
  additional_info?: string;
  requested_by: string;
  status: BookRequestStatus;
  refusal_comment?: string;
  refusal_comment_created_by?: string;
  refusal_comment_updated_by?: string;
  refusal_comment_created_at?: string;
  refusal_comment_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BookRequestWithUser extends BookRequest {
  requester_email?: string;
  refusal_comment_creator_email?: string;
  refusal_comment_updater_email?: string;
}
