# API Endpoints

All API routes are located in `app/api/` and follow Next.js 15 App Router conventions.

## Authentication

All endpoints except public reads require authentication via Supabase Auth.

**Auth Check Pattern:**
```typescript
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## Books API

### `GET /api/books`

Get all series with their books.

**Authentication:** None required (public data)

**Response:**
```json
{
  "series": [
    {
      "id": "horus-heresy",
      "name": "The Horus Heresy",
      "description": "...",
      "books": [
        {
          "id": "hh-01",
          "title": "Horus Rising",
          "author": "Dan Abnett",
          "orderInSeries": 1,
          "faction": ["Luna Wolves/Sons of Horus"],
          "tags": ["Great Crusade", "Horus"]
        }
      ]
    }
  ]
}
```

**Implementation:** `app/api/books/route.ts`

---

### `GET /api/singles`

Get all standalone novels.

**Authentication:** None required (public data)

**Response:**
```json
{
  "singles": [
    {
      "id": "space-marine",
      "title": "Space Marine",
      "author": "Ian Watson",
      "faction": ["Space Marines", "Inquisition"],
      "tags": ["Inquisition War", "Space Marines", "Classic"]
    }
  ]
}
```

**Implementation:** `app/api/singles/route.ts`

---

### `GET /api/novellas`

Get all novellas.

**Authentication:** None required (public data)

**Response:**
```json
{
  "novellas": [
    {
      "id": "aurelian",
      "title": "Aurelian",
      "author": "Aaron Dembski-Bowden",
      "faction": ["Word Bearers", "Chaos", "Daemons"],
      "tags": ["Lorgar", "Word Bearers", "Horus Heresy", "Chaos"]
    }
  ]
}
```

**Implementation:** `app/api/novellas/route.ts`

---

### `GET /api/anthologies`

Get all anthologies and collections.

**Authentication:** None required (public data)

**Response:**
```json
{
  "anthologies": [
    {
      "id": "let-the-galaxy-burn",
      "title": "Let the Galaxy Burn",
      "author": "Various",
      "faction": ["Various"],
      "tags": ["Anthology", "Various"]
    }
  ]
}
```

**Implementation:** `app/api/anthologies/route.ts`

---

## Reading Progress API

### `GET /api/reading`

Get current user's reading progress for series books.

**Authentication:** Required

**Response:**
```json
{
  "readingData": [
    {
      "bookId": "hh-01",
      "status": "completed"
    },
    {
      "bookId": "hh-02",
      "status": "reading"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Database error

**Implementation:** `app/api/reading/route.ts`

---

### `POST /api/reading`

Update reading status for a series book.

**Authentication:** Required

**Request Body:**
```json
{
  "bookId": "hh-01",
  "status": "completed"
}
```

**Parameters:**
- `bookId` (string, required) - Book identifier
- `status` (string, required) - One of: "unread", "reading", "completed"

**Response:**
```json
{
  "success": true
}
```

**Implementation:** `app/api/reading/route.ts`

**Note:** Uses upsert logic - creates or updates existing progress record.

---

### `GET /api/reading/singles`

Get current user's reading progress for singles.

**Authentication:** Required

**Response:**
```json
{
  "progress": [
    {
      "book_id": "space-marine",
      "status": "completed",
      "rating": 4
    }
  ]
}
```

**Implementation:** `app/api/reading/singles/route.ts`

**Note:** Database stores `single_id`, but API transforms to `book_id` for frontend consistency.

---

### `POST /api/reading/singles`

Update reading status for a single novel.

**Authentication:** Required

**Request Body:**
```json
{
  "bookId": "space-marine",
  "status": "completed",
  "rating": 4,
  "notes": "Classic 40K novel"
}
```

**Parameters:**
- `bookId` (string, required) - Book identifier
- `status` (string, required) - One of: "unread", "reading", "completed"
- `rating` (integer, optional) - 1-5 rating
- `notes` (string, optional) - User notes

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Implementation:** `app/api/reading/singles/route.ts`

**Note:** Uses upsert logic with `single_id` in database.

---

### `GET /api/reading/novellas`

Get current user's reading progress for novellas.

**Authentication:** Required

**Response:**
```json
{
  "progress": [
    {
      "book_id": "aurelian",
      "status": "reading"
    }
  ]
}
```

**Implementation:** `app/api/reading/novellas/route.ts`

**Note:** Database stores `novella_id`, but API transforms to `book_id` for frontend consistency.

---

### `POST /api/reading/novellas`

Update reading status for a novella.

**Authentication:** Required

**Request Body:**
```json
{
  "bookId": "aurelian",
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Implementation:** `app/api/reading/novellas/route.ts`

**Note:** Uses upsert logic with `novella_id` in database.

---

### `GET /api/reading/anthologies`

Get current user's reading progress for anthologies.

**Authentication:** Required

**Response:**
```json
{
  "progress": [
    {
      "book_id": "let-the-galaxy-burn",
      "status": "completed",
      "rating": 5
    }
  ]
}
```

**Implementation:** `app/api/reading/anthologies/route.ts`

**Note:** Database stores `anthology_id`, but API transforms to `book_id` for frontend consistency.

---

### `POST /api/reading/anthologies`

Update reading status for an anthology.

**Authentication:** Required

**Request Body:**
```json
{
  "bookId": "let-the-galaxy-burn",
  "status": "completed",
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Implementation:** `app/api/reading/anthologies/route.ts`

**Note:** Uses upsert logic with `anthology_id` in database.

---

## Book Requests API

### `GET /api/requests`

Get all book requests with optional status filtering.

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status: "pending", "waitlist", "approved", "refused"

**Response:**
```json
{
  "requests": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "The Emperor's Gift",
      "author": "Aaron Dembski-Bowden",
      "book_type": "single",
      "additional_info": "About the Grey Knights",
      "requested_by": "user-uuid",
      "status": "pending",
      "refusal_comment": null,
      "refusal_comment_created_by": null,
      "refusal_comment_updated_by": null,
      "refusal_comment_created_at": null,
      "refusal_comment_updated_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Database error

**Implementation:** `app/api/requests/route.ts`

**Usage:**
- All authenticated users can view all requests
- Used by the requests dashboard to display requests by status

---

### `POST /api/requests`

Create a new book request.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "The Emperor's Gift",
  "author": "Aaron Dembski-Bowden",
  "bookType": "single",
  "additionalInfo": "About the Grey Knights"
}
```

**Parameters:**
- `title` (string, required) - Book title
- `author` (string, required) - Author name
- `bookType` (string, required) - One of: "single", "novella", "anthology", "series", "other"
- `additionalInfo` (string, optional) - Additional context or details

**Response:**
```json
{
  "request": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "The Emperor's Gift",
    "author": "Aaron Dembski-Bowden",
    "book_type": "single",
    "additional_info": "About the Grey Knights",
    "requested_by": "user-uuid",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Database error

**Implementation:** `app/api/requests/route.ts`

**Note:** All new requests default to "pending" status.

---

### `PATCH /api/requests/[id]`

Update a book request's status (admin only).

**Authentication:** Required + Admin

**Request Body:**
```json
{
  "status": "refused",
  "refusalComment": "This book is not part of the Warhammer 40K universe"
}
```

**Parameters:**
- `status` (string, required) - One of: "pending", "waitlist", "approved", "refused"
- `refusalComment` (string, conditional) - Required when status is "refused", optional otherwise

**Response:**
```json
{
  "request": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "The Emperor's Gift",
    "status": "refused",
    "refusal_comment": "This book is not part of the Warhammer 40K universe",
    "refusal_comment_created_by": "admin@example.com",
    "refusal_comment_created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status or missing refusal comment
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Database error

**Implementation:** `app/api/requests/[id]/route.ts`

**Refusal Comment Logic:**
- When status → "refused": comment required, creator tracked
- When status changes FROM "refused": comment automatically cleared
- Admins can edit refusal comments, tracked as updater
- Uses admin client to bypass RLS

**Admin Check:**
```typescript
if (!isAdmin(user.email)) {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
```

---

### `DELETE /api/requests/[id]`

Delete a book request (users can only delete their own pending requests).

**Authentication:** Required

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Request is not pending or not owned by user
- `500 Internal Server Error` - Database error

**Implementation:** `app/api/requests/[id]/route.ts`

**RLS Policy:** Users can only delete requests where:
- `requested_by` matches their user ID
- `status` is "pending"

---

## Import API

### `GET /api/import/list`

List all available folders and JSON files in `data/` directory.

**Authentication:** None required

**Response:**
```json
{
  "folders": [
    {
      "name": "Series",
      "path": "series",
      "files": [
        "horus-heresy.json",
        "siege-of-terra.json"
      ]
    },
    {
      "name": "Singles",
      "path": "singles",
      "files": [
        "space-marine.json",
        "fire-caste.json"
      ]
    },
    {
      "name": "Novellas",
      "path": "novellas",
      "files": [
        "aurelian.json"
      ]
    },
    {
      "name": "Anthologies",
      "path": "anthologies",
      "files": [
        "let-the-galaxy-burn.json"
      ]
    }
  ]
}
```

**Implementation:** `app/api/import/list/route.ts`

**Behavior:**
- Scans all subdirectories in `data/`
- Skips `_meta` folders
- Only returns folders with `.json` files
- Alphabetically sorts files
- Sorts folders: series, singles, novellas, anthologies

---

### `POST /api/import`

Import selected JSON files to database.

**Authentication:** Required + Admin check (uses service role internally)

**Request Body:**
```json
{
  "files": [
    {
      "folder": "series",
      "file": "horus-heresy.json"
    },
    {
      "folder": "singles",
      "file": "space-marine.json"
    },
    {
      "folder": "novellas",
      "file": "aurelian.json"
    },
    {
      "folder": "anthologies",
      "file": "let-the-galaxy-burn.json"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Import completed: 2 series, 64 books, 5 singles, 3 novellas, 2 anthologies",
  "results": {
    "series": 2,
    "books": 64,
    "singles": 5,
    "novellas": 3,
    "anthologies": 2,
    "errors": []
  }
}
```

**Response (With Errors):**
```json
{
  "success": true,
  "message": "Import completed: 2 series, 62 books, 5 singles",
  "results": {
    "series": 2,
    "books": 62,
    "singles": 5,
    "novellas": 0,
    "anthologies": 0,
    "errors": [
      "Book hh-05: Duplicate key violation",
      "Single space-marine: Invalid faction format"
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User not admin
- `400 Bad Request` - No files selected
- `500 Internal Server Error` - Import failure

**Implementation:** `app/api/import/route.ts`

**Features:**
- Uses service role to bypass RLS
- Upserts series, series_books, singles, novellas, anthologies
- Normalizes tags/factions against canonical lists
- Auto-updates all `_meta/tags.json` and `_meta/factions.json` files
- Continues on individual errors (partial success)

**Normalization:**
1. Loads canonical lists from `series/_meta/` (master source)
2. Case-insensitive matching for existing values
3. New values are added automatically
4. Updates all four category `_meta/` folders
5. Prevents duplicates like "Space Wolves" vs "space wolves"

---

### `GET /api/import/check-admin`

Check if current user is an admin.

**Authentication:** Required

**Response:**
```json
{
  "isAdmin": true
}
```

**Implementation:** `app/api/import/check-admin/route.ts`

**Usage:** Used by frontend to show/hide admin features.

---

## Filters API

### `GET /api/filters`

Get all unique tags and factions from the database.

**Authentication:** None required

**Response:**
```json
{
  "tags": [
    "Adeptus Mechanicus",
    "Alpharius",
    "Angron",
    ...
  ],
  "factions": [
    "Adeptus Mechanicus",
    "Alpha Legion",
    "Blood Angels",
    ...
  ]
}
```

**Implementation:** `app/api/filters/route.ts`

**Performance:**
- Fast query (only selects tag/faction columns)
- Results cached on client
- Sorted alphabetically

---

## Auth Callback

### `GET /auth/callback`

OAuth callback handler for Google Sign-In.

**Authentication:** N/A (handles authentication)

**Query Parameters:**
- `code` - Authorization code from Google
- `error` - Error message if auth failed

**Behavior:**
1. Exchanges code for session
2. Sets session cookie
3. Redirects to `/dashboard`
4. On error: redirects to `/` with error in URL

**Implementation:** `app/auth/callback/route.ts`

**Note:** This is handled automatically by Supabase Auth. Users never call this directly.

---

## API Summary

### Book Category Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/books` | GET | None | Get all series with books |
| `/api/singles` | GET | None | Get all singles |
| `/api/novellas` | GET | None | Get all novellas |
| `/api/anthologies` | GET | None | Get all anthologies |

### Reading Progress Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/reading` | GET | Required | Get series books progress |
| `/api/reading` | POST | Required | Update series book status |
| `/api/reading/singles` | GET | Required | Get singles progress |
| `/api/reading/singles` | POST | Required | Update singles status |
| `/api/reading/novellas` | GET | Required | Get novellas progress |
| `/api/reading/novellas` | POST | Required | Update novellas status |
| `/api/reading/anthologies` | GET | Required | Get anthologies progress |
| `/api/reading/anthologies` | POST | Required | Update anthologies status |

### Book Requests Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/requests` | GET | Required | Get all book requests |
| `/api/requests` | POST | Required | Create new book request |
| `/api/requests/[id]` | PATCH | Admin | Update request status |
| `/api/requests/[id]` | DELETE | Required | Delete own pending request |

### Admin Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/import/list` | GET | None | List available files |
| `/api/import` | POST | Admin | Import files to database |
| `/api/import/check-admin` | GET | Required | Check admin status |

### Utility Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/filters` | GET | None | Get all tags/factions |
| `/auth/callback` | GET | N/A | OAuth callback |

---

## Error Handling Patterns

### Standard Error Response

```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

### Common Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Admin access required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Handling Example

```typescript
try {
  const response = await fetch('/api/books');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  toast.error('Failed to load books');
}
```

---

## Testing API Endpoints

### Using cURL

**Get books:**
```bash
curl http://localhost:3000/api/books
```

**Get singles:**
```bash
curl http://localhost:3000/api/singles
```

**Update reading status (requires auth):**
```bash
curl -X POST http://localhost:3000/api/reading \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"bookId":"hh-01","status":"completed"}'
```

**Import files:**
```bash
curl -X POST http://localhost:3000/api/import \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"files":[{"folder":"series","file":"horus-heresy.json"},{"folder":"singles","file":"space-marine.json"}]}'
```

### Using Browser DevTools

```javascript
// Get books
fetch('/api/books').then(r => r.json()).then(console.log);

// Get singles
fetch('/api/singles').then(r => r.json()).then(console.log);

// Update status
fetch('/api/reading', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookId: 'hh-01', status: 'completed' })
}).then(r => r.json()).then(console.log);
```

---

## Future Endpoints

Potential additions:

1. **`GET /api/stats`** - Combined user statistics across all categories
2. **`POST /api/books/search`** - Full-text search across all books
3. **`GET /api/recommendations`** - Suggest next books to read
4. **`POST /api/export`** - Export user progress as JSON
5. **`GET /api/timeline`** - Chronological timeline of events
6. **`POST /api/reviews`** - Submit book reviews

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production:

- Per-user: 100 requests/minute
- Per-IP: 200 requests/minute
- Import endpoint: 10 requests/hour

Use Supabase Edge Functions or Vercel rate limiting when needed.
