-- Create singles table (standalone novels)
CREATE TABLE IF NOT EXISTS singles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create novellas table
CREATE TABLE IF NOT EXISTS novellas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anthologies table
CREATE TABLE IF NOT EXISTS anthologies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  faction TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_progress entries for singles
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

-- Create reading_progress entries for novellas
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

-- Create reading_progress entries for anthologies
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_singles_user_id ON reading_progress_singles(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_singles_single_id ON reading_progress_singles(single_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_singles_status ON reading_progress_singles(status);

CREATE INDEX IF NOT EXISTS idx_reading_progress_novellas_user_id ON reading_progress_novellas(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_novellas_novella_id ON reading_progress_novellas(novella_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_novellas_status ON reading_progress_novellas(status);

CREATE INDEX IF NOT EXISTS idx_reading_progress_anthologies_user_id ON reading_progress_anthologies(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_anthologies_anthology_id ON reading_progress_anthologies(anthology_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_anthologies_status ON reading_progress_anthologies(status);

-- Enable Row Level Security
ALTER TABLE singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE novellas ENABLE ROW LEVEL SECURITY;
ALTER TABLE anthologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_novellas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress_anthologies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for singles (public read, admin insert)
CREATE POLICY "Singles are viewable by everyone"
  ON singles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert singles"
  ON singles FOR INSERT
  WITH CHECK (true);

-- RLS Policies for novellas (public read, admin insert)
CREATE POLICY "Novellas are viewable by everyone"
  ON novellas FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert novellas"
  ON novellas FOR INSERT
  WITH CHECK (true);

-- RLS Policies for anthologies (public read, admin insert)
CREATE POLICY "Anthologies are viewable by everyone"
  ON anthologies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert anthologies"
  ON anthologies FOR INSERT
  WITH CHECK (true);

-- RLS Policies for reading_progress_singles
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

-- RLS Policies for reading_progress_novellas
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

-- RLS Policies for reading_progress_anthologies
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

-- Triggers to automatically update updated_at
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
