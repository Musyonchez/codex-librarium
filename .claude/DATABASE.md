# Database Schema

The application uses **Supabase** (PostgreSQL) as its database with Row Level Security (RLS) enabled for data protection.

## Tables

### `series`

Stores book series information (Horus Heresy, Siege of Terra, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique identifier (kebab-case) |
| `name` | text | NOT NULL | Display name |
| `description` | text | NOT NULL | Brief description |
| `created_at` | timestamptz | DEFAULT now() | Auto-generated timestamp |

**Example:**
```sql
{
  id: 'horus-heresy',
  name: 'The Horus Heresy',
  description: 'The galaxy-spanning civil war...',
  created_at: '2024-01-01T00:00:00Z'
}
```

**Indexes:**
- Primary key on `id`

**RLS Policies:**
- Public read access
- No write access (managed through import API)

---

### `books`

Stores individual book information with metadata

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
```sql
{
  id: 'hh-01',
  series_id: 'horus-heresy',
  title: 'Horus Rising',
  author: 'Dan Abnett',
  order_in_series: 1,
  faction: ['Luna Wolves/Sons of Horus'],
  tags: ['Great Crusade', 'Horus', 'Loken'],
  created_at: '2024-01-01T00:00:00Z'
}
```

**Indexes:**
- Primary key on `id`
- Foreign key on `series_id`
- Index on `order_in_series` for sorting

**RLS Policies:**
- Public read access
- No write access (managed through import API)

---

### `reading_progress`

Tracks user reading status for each book

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Auto-generated UUID |
| `user_id` | uuid | FOREIGN KEY → auth.users(id) | Owner user |
| `book_id` | text | FOREIGN KEY → books(id) | Book being tracked |
| `status` | text | NOT NULL | 'unread', 'reading', or 'completed' |
| `updated_at` | timestamptz | DEFAULT now() | Last status change |
| `created_at` | timestamptz | DEFAULT now() | First tracked date |

**Constraints:**
- UNIQUE(`user_id`, `book_id`) - One status per user per book

**Example:**
```sql
{
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  book_id: 'hh-01',
  status: 'completed',
  updated_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-10T08:00:00Z'
}
```

**Indexes:**
- Primary key on `id`
- Unique index on `(user_id, book_id)`
- Index on `user_id` for user queries

**RLS Policies:**
- Users can only read their own data
- Users can only insert/update their own data
- Delete is disabled (status cycling only)

---

## Relationships

```
series (1) ──< (many) books
             └──< (many) reading_progress >── (1) auth.users
```

**Cascade Behavior:**
- Deleting a series → cascades to books → cascades to reading_progress
- Deleting a user → cascades to reading_progress (via RLS)

---

## Row Level Security (RLS)

### Philosophy

- **Public Read**: Series and books are public data
- **Private Write**: Only authenticated imports can modify books/series
- **User Isolation**: Reading progress is strictly per-user

### Policy Details

**`series` table:**
```sql
-- Allow public read
CREATE POLICY "Allow public read" ON series
  FOR SELECT USING (true);

-- No insert/update/delete policies (admin-only via service role)
```

**`books` table:**
```sql
-- Allow public read
CREATE POLICY "Allow public read" ON books
  FOR SELECT USING (true);

-- No insert/update/delete policies (admin-only via service role)
```

**`reading_progress` table:**
```sql
-- Users can read only their own progress
CREATE POLICY "Users can read own progress" ON reading_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON reading_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Database Functions

### Aggregate Queries

**Get all books with reading status for a user:**
```sql
SELECT
  b.*,
  COALESCE(rp.status, 'unread') as reading_status
FROM books b
LEFT JOIN reading_progress rp
  ON b.id = rp.book_id
  AND rp.user_id = auth.uid()
ORDER BY b.order_in_series;
```

**Get series with book count:**
```sql
SELECT
  s.*,
  COUNT(b.id) as book_count
FROM series s
LEFT JOIN books b ON s.id = b.series_id
GROUP BY s.id
ORDER BY s.name;
```

**Get user statistics:**
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'reading') as reading_count,
  COUNT(*) FILTER (WHERE status = 'unread') as unread_count
FROM reading_progress
WHERE user_id = auth.uid();
```

---

## Data Normalization

### Tags and Factions

Tags and factions are stored as PostgreSQL arrays (`text[]`) for simplicity. A normalization system exists at the application level:

**Canonical lists:**
- `data/tags.json` - 107 unique tags
- `data/factions.json` - 28 unique factions

**Normalization process:**
1. Import reads canonical lists
2. Case-insensitive matching finds existing versions
3. New tags/factions are added automatically
4. All values are sorted alphabetically

**Benefits:**
- Prevents "Blood Angels" vs "blood angels" duplicates
- Maintains consistency across imports
- Self-maintaining (auto-updates canonical lists)

---

## Migrations

### Location

Migration files: `supabase/migrations/`

### Migration History

**001_initial_schema.sql** - Created tables and RLS policies
**002_rename_legion_to_faction.sql** - Renamed `legion` column to `faction`

### Running Migrations

```bash
# Local development
supabase db reset

# Production (via Supabase dashboard)
# Copy SQL from migration file and run in SQL editor
```

---

## Backup Strategy

### JSON Files as Master Data

The `data/series/*.json` files serve as the source of truth for books and series:

- Version controlled in git
- Easy to edit and review
- Human-readable backup
- Imported to database via web UI

**Workflow:**
1. Edit JSON files locally
2. Commit to git (history + backup)
3. Import via web interface
4. Database is synced

### User Data Backup

User reading progress should be backed up separately:

```sql
-- Export user progress
SELECT * FROM reading_progress WHERE user_id = '...';

-- Restore user progress
INSERT INTO reading_progress (user_id, book_id, status)
VALUES (...);
```

Consider implementing periodic exports via Supabase scheduled functions.

---

## Performance Considerations

### Current Scale

- ~80 books across 3 series
- Multiple users (100-1000 expected)
- ~100-1000 reading progress records

### Optimization

**Indexes:**
- All foreign keys are indexed
- Unique constraints create indexes automatically
- Additional indexes on `order_in_series` for sorting

**Query Performance:**
- All queries return in <50ms at current scale
- No need for additional optimization yet
- Consider adding indexes if slow queries emerge

**Future Scaling:**
- Add pagination when books > 500
- Consider materialized views for statistics
- Add caching layer if needed (Redis)

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
- Can read public data, write own progress

**Service Role Client (Server):**
- Used in import API only
- Bypasses RLS
- Full database access

### Connection Code

```typescript
// Browser client
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server client (respects RLS)
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Service role (bypasses RLS)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey);
```

---

## Troubleshooting

### Common Issues

**RLS Policy Errors:**
- Check if user is authenticated
- Verify policy allows the operation
- Use service role for admin operations

**Duplicate Key Errors:**
- Book IDs must be unique across all series
- `(user_id, book_id)` must be unique in reading_progress

**Foreign Key Violations:**
- Ensure series exists before adding books
- Ensure book exists before adding reading progress

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'reading_progress';

-- Check current user
SELECT auth.uid();

-- Count records per table
SELECT COUNT(*) FROM series;
SELECT COUNT(*) FROM books;
SELECT COUNT(*) FROM reading_progress;
```

---

## Future Enhancements

Potential schema additions:

1. **User preferences table** - Store settings per user
2. **Book reviews table** - Allow users to rate/review books
3. **Reading sessions** - Track time spent reading
4. **Reading goals** - Set monthly/yearly targets
5. **Book recommendations** - Store ML-generated suggestions
6. **Audiobook links** - Add external resource links

All future additions should maintain RLS principles and keep data separated by user.
