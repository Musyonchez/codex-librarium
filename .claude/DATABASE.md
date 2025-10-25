# Database Schema

The application uses **Supabase** (PostgreSQL) as its database with Row Level Security (RLS) enabled for data protection.

## Tables Overview

The database is organized into four book categories, each with its own table and reading progress tracking:

- **Series Books**: `series` + `series_books` + `reading_progress_series_books`
- **Singles**: `singles` + `reading_progress_singles`
- **Novellas**: `novellas` + `reading_progress_novellas`
- **Anthologies**: `anthologies` + `reading_progress_anthologies`

Additionally:
- **Book Requests**: `book_requests` - User-submitted requests for books to be added

---

## Book Tables

### `series`

Stores book series information (Horus Heresy, Siege of Terra, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique identifier (kebab-case) |
| `name` | text | NOT NULL | Display name |
| `description` | text | NOT NULL | Brief description |
| `created_at` | timestamptz | DEFAULT now() | Auto-generated timestamp |

**Example:**
```json
{
  "id": "horus-heresy",
  "name": "The Horus Heresy",
  "description": "The galaxy-spanning civil war...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### `series_books`

Stores individual books that are part of a series

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique identifier (e.g., 'hh-01') |
| `series_id` | text | FOREIGN KEY → series(id) | Parent series |
| `title` | text | NOT NULL | Book title |
| `author` | text | NOT NULL | Author name |
| `order_in_series` | integer | NOT NULL | Publication/reading order |
| `faction` | text[] | | Array of factions featured |
| `tags` | text[] | | Array of keywords/themes |
| `created_at` | timestamptz | DEFAULT now() | Auto-generated timestamp |

**Example:**
```json
{
  "id": "hh-01",
  "series_id": "horus-heresy",
  "title": "Horus Rising",
  "author": "Dan Abnett",
  "order_in_series": 1,
  "faction": ["Luna Wolves/Sons of Horus"],
  "tags": ["Great Crusade", "Horus", "Loken"]
}
```

**Indexes:**
- Primary key on `id`
- Foreign key index on `series_id`
- Index on `order_in_series` for sorting

---

### `singles`

Stores standalone novels (not part of a series)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique identifier |
| `title` | text | NOT NULL | Book title |
| `author` | text | NOT NULL | Author name |
| `faction` | text[] | | Array of factions featured |
| `tags` | text[] | | Array of keywords/themes |
| `created_at` | timestamptz | DEFAULT now() | Auto-generated timestamp |

**Example:**
```json
{
  "id": "space-marine",
  "title": "Space Marine",
  "author": "Ian Watson",
  "faction": ["Space Marines", "Inquisition"],
  "tags": ["Inquisition War", "Space Marines", "Classic"]
}
```

---

### `novellas`

Stores novella-length stories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique identifier |
| `title` | text | NOT NULL | Novella title |
| `author` | text | NOT NULL | Author name |
| `faction` | text[] | | Array of factions featured |
| `tags` | text[] | | Array of keywords/themes |
| `created_at` | timestamptz | DEFAULT now() | Auto-generated timestamp |

---

### `anthologies`

Stores anthology collections and omnibus editions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique identifier |
| `title` | text | NOT NULL | Collection title |
| `author` | text | NOT NULL | Author name (often "Various") |
| `faction` | text[] | | Array of factions featured |
| `tags` | text[] | | Array of keywords/themes |
| `created_at` | timestamptz | DEFAULT now() | Auto-generated timestamp |

---

### `book_requests`

Stores user requests for books to be added to the library

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `title` | text | NOT NULL | Requested book title |
| `author` | text | NOT NULL | Author name |
| `book_type` | text | CHECK | 'single', 'novella', 'anthology', 'series', 'other' |
| `additional_info` | text | | User-provided context/details |
| `requested_by` | uuid | FOREIGN KEY → auth.users(id) | User who made request |
| `status` | text | NOT NULL, CHECK | 'pending', 'waitlist', 'approved', 'refused' |
| `refusal_comment` | text | | Admin explanation (only for 'refused') |
| `refusal_comment_created_by` | uuid | FOREIGN KEY → auth.users(id) | Admin who refused |
| `refusal_comment_updated_by` | uuid | FOREIGN KEY → auth.users(id) | Admin who edited comment |
| `refusal_comment_created_at` | timestamptz | | When comment was created |
| `refusal_comment_updated_at` | timestamptz | | When comment was last edited |
| `created_at` | timestamptz | DEFAULT now() | Request creation date |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Constraints:**
- CHECK book_type IN ('single', 'novella', 'anthology', 'series', 'other')
- CHECK status IN ('pending', 'waitlist', 'approved', 'refused')

**Indexes:**
- `idx_book_requests_status` - ON book_requests(status)
- `idx_book_requests_requested_by` - ON book_requests(requested_by)
- `idx_book_requests_created_at` - ON book_requests(created_at DESC)

**Triggers:**
- Auto-update `updated_at` on UPDATE

**Refusal Comment Logic:**
- When status → 'refused': comment required, creator tracked
- When status changes FROM 'refused': comment automatically cleared
- Admins can edit refusal comments, tracked as updater

---

## Reading Progress Tables

### `reading_progress_series_books`

Tracks user reading status for series books

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `user_id` | uuid | FOREIGN KEY → auth.users(id) | Owner user |
| `book_id` | text | FOREIGN KEY → series_books(id) | Book being tracked |
| `status` | text | NOT NULL | 'unread', 'reading', or 'completed' |
| `rating` | integer | CHECK (1-5) | User rating (optional) |
| `notes` | text | | User notes (optional) |
| `started_at` | timestamptz | | When user started reading |
| `completed_at` | timestamptz | | When user completed |
| `created_at` | timestamptz | DEFAULT now() | First tracked date |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Constraints:**
- UNIQUE(`user_id`, `book_id`) - One status per user per book
- CHECK status IN ('unread', 'reading', 'completed')
- CHECK rating BETWEEN 1 AND 5

**Triggers:**
- Auto-update `updated_at` on UPDATE

---

### `reading_progress_singles`

Same structure as `reading_progress_series_books` but tracks singles

**Key Differences:**
- `single_id` instead of `book_id`
- Foreign key references `singles(id)`

---

### `reading_progress_novellas`

Same structure but tracks novellas

**Key Differences:**
- `novella_id` instead of `book_id`
- Foreign key references `novellas(id)`

---

### `reading_progress_anthologies`

Same structure but tracks anthologies

**Key Differences:**
- `anthology_id` instead of `book_id`
- Foreign key references `anthologies(id)`

---

## Relationships

```
series (1) ──< (many) series_books ──< (many) reading_progress_series_books >── (1) auth.users

singles (1) ──< (many) reading_progress_singles >── (1) auth.users

novellas (1) ──< (many) reading_progress_novellas >── (1) auth.users

anthologies (1) ──< (many) reading_progress_anthologies >── (1) auth.users

auth.users (1) ──< (many) book_requests (requested_by)
auth.users (1) ──< (many) book_requests (refusal_comment_created_by)
auth.users (1) ──< (many) book_requests (refusal_comment_updated_by)
```

**Cascade Behavior:**
- Deleting a series → cascades to series_books → cascades to reading_progress
- Deleting a single/novella/anthology → cascades to its reading_progress
- Deleting a user → cascades to all their reading_progress records

---

## Row Level Security (RLS)

### Philosophy

- **Public Read**: All books (series, singles, novellas, anthologies) are public data
- **Private Write**: Only authenticated imports (service role) can modify books
- **User Isolation**: Reading progress is strictly per-user

### Policy Details

**Book tables (series, series_books, singles, novellas, anthologies):**
```sql
-- Allow public read
CREATE POLICY "Books are viewable by everyone"
  ON <table_name> FOR SELECT
  USING (true);

-- Allow anyone to insert (service role handles auth at API level)
CREATE POLICY "Anyone can insert books"
  ON <table_name> FOR INSERT
  WITH CHECK (true);
```

**Reading progress tables:**
```sql
-- Users can read only their own progress
CREATE POLICY "Users can view their own reading progress"
  ON <table_name> FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own reading progress"
  ON <table_name> FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own reading progress"
  ON <table_name> FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own reading progress"
  ON <table_name> FOR DELETE
  USING (auth.uid() = user_id);
```

**Book Requests table:**
```sql
-- All authenticated users can view all requests
CREATE POLICY "Anyone can view book requests"
  ON book_requests FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own requests
CREATE POLICY "Users can create their own requests"
  ON book_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requested_by);

-- Users can update/delete only their own pending requests
CREATE POLICY "Users can update their own pending requests"
  ON book_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requested_by AND status = 'pending')
  WITH CHECK (auth.uid() = requested_by AND status = 'pending');

CREATE POLICY "Users can delete their own pending requests"
  ON book_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = requested_by AND status = 'pending');

-- Note: Admin status updates bypass RLS via service role
```

---

## Indexes

### Performance Indexes

**Series Books:**
- `idx_series_books_series_id` - ON series_books(series_id)
- `idx_series_books_order` - ON series_books(order_in_series)

**Reading Progress:**
- `idx_reading_progress_series_books_user_id` - User queries
- `idx_reading_progress_series_books_book_id` - Book queries
- `idx_reading_progress_series_books_status` - Status filtering
- Similar indexes for singles, novellas, anthologies

---

## Database Functions

### Triggers

**Auto-update timestamps:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to all reading_progress tables
CREATE TRIGGER update_reading_progress_series_books_updated_at
  BEFORE UPDATE ON reading_progress_series_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Data Normalization

### Tags and Factions

Tags and factions are stored as PostgreSQL arrays (`text[]`) with application-level normalization:

**Canonical lists location:**
- `data/series/_meta/tags.json`
- `data/series/_meta/factions.json`
- `data/singles/_meta/tags.json`
- `data/singles/_meta/factions.json`
- `data/novellas/_meta/tags.json`
- `data/novellas/_meta/factions.json`
- `data/anthologies/_meta/tags.json`
- `data/anthologies/_meta/factions.json`

**Normalization process during import:**
1. Import reads canonical lists from `series/_meta/` (master source)
2. Case-insensitive matching finds existing versions
3. New tags/factions are added automatically
4. All `_meta/` folders are updated with new canonical values
5. All values are sorted alphabetically

**Benefits:**
- Prevents "Blood Angels" vs "blood angels" duplicates
- Maintains consistency across all categories
- Self-maintaining (auto-updates canonical lists)
- Cross-category consistency

---

## Migrations

### Migration Files

Location: `supabase/migrations/`

**Migration History:**
1. `001_initial_schema.sql` - Created series and books tables with RLS
2. `002_rename_legion_to_faction.sql` - Renamed legion → faction column
3. `003_add_singles_novellas_anthologies.sql` - Added new category tables
4. `004_complete_fresh_schema.sql` - Complete schema (series_books rename + all categories)
5. `005_add_book_requests.sql` - Added book_requests table for user requests

### Running Migrations

```bash
# Apply all migrations
npx supabase db push

# Reset database (development only)
npx supabase db reset
```

**Current Migration (004):**
- Creates all tables from scratch
- Includes all RLS policies
- All indexes for performance
- All triggers for auto-updates

---

## Current Scale

### Book Statistics
- **76 series** with books
- **85 standalone novels**
- **97 novellas**
- **129 anthologies**
- **387+ total books**

### Expected Users
- 100-1000 users expected
- ~10,000-50,000 reading progress records

### Query Performance
- All queries return in <50ms at current scale
- Indexes ensure fast lookups
- No optimization needed yet

---

## Backup Strategy

### JSON Files as Master Data

The `data/` directory serves as the source of truth:

- Version controlled in git
- Easy to edit and review
- Human-readable backup
- Organized by category (series, singles, novellas, anthologies)

**Workflow:**
1. Edit JSON files locally
2. Commit to git (history + backup)
3. Import via `/import` page (selective file import)
4. Database is synced

### User Data Backup

User reading progress should be backed up separately via Supabase:

```sql
-- Export user progress (all categories)
SELECT * FROM reading_progress_series_books WHERE user_id = '...';
SELECT * FROM reading_progress_singles WHERE user_id = '...';
SELECT * FROM reading_progress_novellas WHERE user_id = '...';
SELECT * FROM reading_progress_anthologies WHERE user_id = '...';
```

---

## Connection Details

### Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # For imports
```

### Client Types

**Anon Client (Browser):**
- Used by default in client components
- Subject to RLS policies
- Can read public books, write own progress

**Service Role Client (Server - Import API only):**
- Used in import API only
- Bypasses RLS
- Full database access

---

## Future Enhancements

Potential schema additions:

1. **User preferences table** - Store UI settings per user
2. **Book reviews/ratings table** - Detailed reviews beyond simple ratings
3. **Reading sessions** - Track time spent reading
4. **Reading goals** - Set monthly/yearly targets
5. **Book recommendations** - ML-generated suggestions
6. **External links** - Audiobook, Kindle, physical book links

All future additions should maintain RLS principles and keep data separated by user.
