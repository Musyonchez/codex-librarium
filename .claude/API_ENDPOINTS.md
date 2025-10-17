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

**Usage:**
```typescript
const response = await fetch('/api/books');
const data = await response.json();
```

---

## Reading Progress API

### `GET /api/reading`

Get current user's reading progress for all books.

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

**Usage:**
```typescript
const response = await fetch('/api/reading');
if (!response.ok) {
  // Handle error
}
const data = await response.json();
```

---

### `POST /api/reading`

Update reading status for a book.

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

**Error Responses:**
- `400 Bad Request` - Missing or invalid bookId/status
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Database error

**Implementation:** `app/api/reading/route.ts`

**Usage:**
```typescript
const response = await fetch('/api/reading', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookId: 'hh-01',
    status: 'completed'
  })
});

if (!response.ok) {
  // Handle error
}
```

**Note:** Uses upsert logic - creates or updates existing progress record.

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
      "name": "series",
      "path": "series",
      "files": [
        "horus-heresy.json",
        "siege-of-terra.json",
        "primarchs.json"
      ]
    }
  ]
}
```

**Implementation:** `app/api/import/list/route.ts`

**Behavior:**
- Scans all subdirectories in `data/`
- Only returns folders with `.json` files
- Ignores loose files in `data/` root
- Alphabetically sorts files

---

### `POST /api/import`

Import selected JSON files to database.

**Authentication:** Required (uses service role internally)

**Request Body:**
```json
{
  "files": [
    {
      "folder": "series",
      "file": "horus-heresy.json"
    },
    {
      "folder": "series",
      "file": "siege-of-terra.json"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Import completed: 2 series, 64 books",
  "results": {
    "series": 2,
    "books": 64,
    "errors": []
  }
}
```

**Response (With Errors):**
```json
{
  "success": true,
  "message": "Import completed: 2 series, 62 books",
  "results": {
    "series": 2,
    "books": 62,
    "errors": [
      "Book hh-05: Duplicate key violation",
      "Book hh-12: Invalid faction format"
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - No files selected
- `500 Internal Server Error` - Import failure

**Implementation:** `app/api/import/route.ts`

**Features:**
- Uses service role to bypass RLS
- Upserts series and books (insert or update)
- Normalizes tags/factions against canonical lists
- Auto-updates `data/tags.json` and `data/factions.json`
- Continues on individual errors (partial success)

**Normalization:**
1. Loads `data/tags.json` and `data/factions.json`
2. Case-insensitive matching for existing values
3. New values are added and files are updated
4. Prevents duplicates like "Space Wolves" vs "space wolves"

**Usage:**
```typescript
const response = await fetch('/api/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    files: [
      { folder: 'series', file: 'horus-heresy.json' }
    ]
  })
});

const data = await response.json();
if (data.success) {
  console.log(data.message);
  if (data.results.errors.length > 0) {
    console.warn('Errors:', data.results.errors);
  }
}
```

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

**Usage:**
```typescript
const response = await fetch('/api/filters');
const { tags, factions } = await response.json();
```

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

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production:

- Per-user: 100 requests/minute
- Per-IP: 200 requests/minute
- Import endpoint: 10 requests/hour

Use Supabase Edge Functions or Vercel rate limiting when needed.

---

## CORS

CORS is handled automatically by Next.js:

- Same-origin requests: Allowed
- Cross-origin: Requires configuration

For API access from external domains:

```typescript
export async function GET(request: Request) {
  const response = NextResponse.json({ ... });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST');

  return response;
}
```

---

## Testing API Endpoints

### Using cURL

**Get books:**
```bash
curl http://localhost:3000/api/books
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
  -d '{"files":[{"folder":"series","file":"horus-heresy.json"}]}'
```

### Using Browser DevTools

```javascript
// Get books
fetch('/api/books').then(r => r.json()).then(console.log);

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

1. **`GET /api/stats`** - User statistics (completion %, books read)
2. **`POST /api/books/search`** - Full-text search across books
3. **`GET /api/recommendations`** - Suggest next books to read
4. **`POST /api/export`** - Export user progress as JSON
5. **`GET /api/timeline`** - Chronological timeline of events
6. **`POST /api/reviews`** - Submit book reviews

---

## API Versioning

Currently no versioning. If breaking changes needed:

**Option 1: Path versioning**
```
/api/v1/books
/api/v2/books
```

**Option 2: Header versioning**
```
API-Version: 1
API-Version: 2
```

For now, maintain backwards compatibility and avoid breaking changes.
