-- Complete fresh schema with all tables
-- This migration creates all tables from scratch for the Codex Librarium

-- Function to update updated_at timestamp (needed for triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SERIES AND SERIES_BOOKS TABLES
-- ============================================================================

-- Create series table
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create series_books table (books that are part of a series)
CREATE TABLE IF NOT EXISTS series_books (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  order_in_series INTEGER NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_progress_series_books table for series books
CREATE TABLE IF NOT EXISTS reading_progress_series_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES series_books(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unread', 'reading', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================================================
-- SINGLES TABLE (Standalone novels)
-- ============================================================================

CREATE TABLE IF NOT EXISTS singles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_progress_singles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  single_id TEXT NOT NULL REFERENCES singles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unread', 'reading', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, single_id)
);

-- ============================================================================
-- NOVELLAS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS novellas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_progress_novellas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  novella_id TEXT NOT NULL REFERENCES novellas(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unread', 'reading', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, novella_id)
);

-- ============================================================================
-- ANTHOLOGIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS anthologies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_progress_anthologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anthology_id TEXT NOT NULL REFERENCES anthologies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unread', 'reading', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anthology_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Series and series_books indexes
CREATE INDEX IF NOT EXISTS idx_series_books_series_id ON series_books(series_id);
CREATE INDEX IF NOT EXISTS idx_series_books_order ON series_books(order_in_series);
CREATE INDEX IF NOT EXISTS idx_reading_progress_series_books_user_id ON reading_progress_series_books(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_series_books_book_id ON reading_progress_series_books(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_series_books_status ON reading_progress_series_books(status);

-- Singles indexes
CREATE INDEX IF NOT EXISTS idx_reading_progress_singles_user_id ON reading_progress_singles(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_singles_single_id ON reading_progress_singles(single_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_singles_status ON reading_progress_singles(status);

-- Novellas indexes
CREATE INDEX IF NOT EXISTS idx_reading_progress_novellas_user_id ON reading_progress_novellas(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_novellas_novella_id ON reading_progress_novellas(novella_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_novellas_status ON reading_progress_novellas(status);

-- Anthologies indexes
CREATE INDEX IF NOT EXISTS idx_reading_progress_anthologies_user_id ON reading_progress_anthologies(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_anthologies_anthology_id ON reading_progress_anthologies(anthology_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_anthologies_status ON reading_progress_anthologies(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_series_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE novellas ENABLE ROW LEVEL SECURITY;
ALTER TABLE anthologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_novellas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_anthologies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - SERIES
-- ============================================================================

CREATE POLICY "Series are viewable by everyone"
  ON series FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert series"
  ON series FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES - SERIES_BOOKS
-- ============================================================================

CREATE POLICY "Series books are viewable by everyone"
  ON series_books FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert series books"
  ON series_books FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES - READING PROGRESS (Series Books)
-- ============================================================================

CREATE POLICY "Users can view their own series books reading progress"
  ON reading_progress_series_books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own series books reading progress"
  ON reading_progress_series_books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series books reading progress"
  ON reading_progress_series_books FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series books reading progress"
  ON reading_progress_series_books FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - SINGLES
-- ============================================================================

CREATE POLICY "Singles are viewable by everyone"
  ON singles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert singles"
  ON singles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own singles reading progress"
  ON reading_progress_singles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own singles reading progress"
  ON reading_progress_singles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own singles reading progress"
  ON reading_progress_singles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own singles reading progress"
  ON reading_progress_singles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - NOVELLAS
-- ============================================================================

CREATE POLICY "Novellas are viewable by everyone"
  ON novellas FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert novellas"
  ON novellas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own novellas reading progress"
  ON reading_progress_novellas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own novellas reading progress"
  ON reading_progress_novellas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own novellas reading progress"
  ON reading_progress_novellas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own novellas reading progress"
  ON reading_progress_novellas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - ANTHOLOGIES
-- ============================================================================

CREATE POLICY "Anthologies are viewable by everyone"
  ON anthologies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert anthologies"
  ON anthologies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own anthologies reading progress"
  ON reading_progress_anthologies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anthologies reading progress"
  ON reading_progress_anthologies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anthologies reading progress"
  ON reading_progress_anthologies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anthologies reading progress"
  ON reading_progress_anthologies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS TO AUTO-UPDATE updated_at
-- ============================================================================

CREATE TRIGGER update_reading_progress_series_books_updated_at
  BEFORE UPDATE ON reading_progress_series_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_singles_updated_at
  BEFORE UPDATE ON reading_progress_singles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_novellas_updated_at
  BEFORE UPDATE ON reading_progress_novellas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_anthologies_updated_at
  BEFORE UPDATE ON reading_progress_anthologies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
