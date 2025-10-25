-- Create book_requests table for user book requests
CREATE TABLE IF NOT EXISTS book_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  book_type TEXT CHECK (book_type IN ('single', 'novella', 'anthology', 'series', 'other')) DEFAULT 'other',
  additional_info TEXT,

  -- User who made the request
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Request status
  status TEXT NOT NULL CHECK (status IN ('pending', 'waitlist', 'approved', 'refused')) DEFAULT 'pending',

  -- Refusal comment (only used when status = 'refused')
  refusal_comment TEXT,
  refusal_comment_created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  refusal_comment_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  refusal_comment_created_at TIMESTAMPTZ,
  refusal_comment_updated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_book_requests_status ON book_requests(status);
CREATE INDEX IF NOT EXISTS idx_book_requests_requested_by ON book_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_book_requests_created_at ON book_requests(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE TRIGGER update_book_requests_updated_at
  BEFORE UPDATE ON book_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all requests
CREATE POLICY "Anyone can view book requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own requests
CREATE POLICY "Users can create their own requests"
  ON book_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requested_by);

-- Allow users to update only their own requests (but only if status is still 'pending')
CREATE POLICY "Users can update their own pending requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requested_by AND status = 'pending')
  WITH CHECK (auth.uid() = requested_by AND status = 'pending');

-- Allow users to delete their own pending requests
CREATE POLICY "Users can delete their own pending requests"
  ON book_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requested_by AND status = 'pending');

-- Note: Admin updates will be handled via service role in the API
