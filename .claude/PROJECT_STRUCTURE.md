# Project Structure

This document explains the organization and architecture of the Warhammer 40K Reading Tracker.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **UI Components:** React 19
- **Notifications:** Sonner (toast notifications)
- **Deployment:** Vercel (recommended)

---

## Directory Structure

```
war_hammer_novels/
├── .claude/                    # AI assistant documentation
│   ├── ADDING_BOOKS.md        # How to add/edit books
│   ├── API_ENDPOINTS.md       # API documentation
│   ├── AUTHENTICATION.md      # Auth system guide
│   ├── DATABASE.md            # Database schema
│   ├── DESIGN_SYSTEM.md       # Colors, styles, patterns
│   ├── PROJECT_STRUCTURE.md   # This file
│   └── READING_ORDER.md       # Reading order information
├── app/                        # Next.js App Router pages
│   ├── api/                   # API routes
│   │   ├── anthologies/       # Get anthologies
│   │   ├── books/             # Get series with books
│   │   ├── filters/           # Get tags/factions
│   │   ├── import/            # Import JSON files
│   │   │   ├── check-admin/   # Admin verification
│   │   │   └── list/          # List available files
│   │   ├── novellas/          # Get novellas
│   │   ├── reading/           # Reading progress (series books)
│   │   │   ├── anthologies/   # Anthologies reading progress
│   │   │   ├── novellas/      # Novellas reading progress
│   │   │   └── singles/       # Singles reading progress
│   │   └── singles/           # Get singles
│   ├── auth/                  # Authentication
│   │   └── callback/          # OAuth callback
│   ├── dashboard/             # User dashboards (tabbed)
│   │   ├── page.tsx           # Series dashboard
│   │   ├── singles/           # Singles dashboard
│   │   ├── novellas/          # Novellas dashboard
│   │   └── anthologies/       # Anthologies dashboard
│   ├── import/                # Import page (admin)
│   ├── order/                 # Book browsing pages
│   │   ├── anthologies/       # Anthologies category
│   │   │   ├── page.tsx       # Redirects to /name
│   │   │   ├── name/          # Browse by name
│   │   │   ├── tags/          # Browse by tags
│   │   │   └── factions/      # Browse by factions
│   │   ├── novellas/          # Novellas category
│   │   │   ├── page.tsx       # Redirects to /name
│   │   │   ├── name/          # Browse by name
│   │   │   ├── tags/          # Browse by tags
│   │   │   └── factions/      # Browse by factions
│   │   ├── series/            # Series category
│   │   │   ├── page.tsx       # Browse by series (default)
│   │   │   ├── name/          # Browse by name
│   │   │   ├── tags/          # Browse by tags
│   │   │   └── factions/      # Browse by factions
│   │   └── singles/           # Singles category
│   │       ├── page.tsx       # Redirects to /name
│   │       ├── name/          # Browse by name
│   │       ├── tags/          # Browse by tags
│   │       └── factions/      # Browse by factions
│   ├── timeline/              # Chronological view
│   ├── favicon.ico            # Site icon
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   ├── not-found.tsx          # 404 page
│   └── page.tsx               # Landing page
├── components/                 # React components
│   ├── AppLayout.tsx          # Main layout wrapper
│   ├── BookDetailsModal.tsx   # Book details modal
│   ├── Dashboard.tsx          # Series dashboard component
│   ├── DashboardTabs.tsx      # Dashboard category tabs
│   ├── Footer.tsx             # Footer
│   ├── Navbar.tsx             # Navigation bar
│   ├── OrderTabs.tsx          # Sorting tabs (Name/Tags/Factions)
│   └── SeriesView.tsx         # Series accordion
├── data/                       # JSON data files (source of truth)
│   ├── anthologies/           # Anthology JSON files
│   │   ├── _meta/             # tags.json, factions.json
│   │   └── *.json             # Individual anthology files
│   ├── novellas/              # Novella JSON files
│   │   ├── _meta/             # tags.json, factions.json
│   │   └── *.json             # Individual novella files
│   ├── series/                # Series JSON files
│   │   ├── _meta/             # tags.json, factions.json (master)
│   │   └── *.json             # Individual series files
│   └── singles/               # Singles JSON files
│       ├── _meta/             # tags.json, factions.json
│       └── *.json             # Individual single files
├── lib/                        # Shared utilities
│   ├── admin.ts               # Admin email verification
│   ├── design-system.ts       # Design tokens
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Browser client
│   │   ├── queries.ts         # Database queries
│   │   └── server.ts          # Server client
│   └── types.ts               # TypeScript types
├── public/                     # Static assets
├── supabase/                   # Supabase config
│   └── migrations/            # Database migrations
│       ├── 001_initial_schema.sql
│       ├── 002_rename_legion_to_faction.sql
│       ├── 003_add_singles_novellas_anthologies.sql
│       └── 004_complete_fresh_schema.sql
├── .env.local                  # Environment variables
├── .env.local.example          # Env template
├── .gitignore                  # Git ignore rules
├── middleware.ts               # Next.js middleware
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Key Directories

### `/app` - Next.js App Router

All pages and API routes follow App Router conventions.

**Pages:**
- `/` - Landing page (public)
- `/dashboard` - Series dashboard (protected)
- `/dashboard/singles` - Singles dashboard (protected)
- `/dashboard/novellas` - Novellas dashboard (protected)
- `/dashboard/anthologies` - Anthologies dashboard (protected)
- `/order/series` - Browse series books (protected)
- `/order/series/name` - Series alphabetically (protected)
- `/order/series/tags` - Series by tags (protected)
- `/order/series/factions` - Series by factions (protected)
- `/order/singles/name` - Singles alphabetically (protected)
- `/order/singles/tags` - Singles by tags (protected)
- `/order/singles/factions` - Singles by factions (protected)
- `/order/novellas/name` - Novellas alphabetically (protected)
- `/order/novellas/tags` - Novellas by tags (protected)
- `/order/novellas/factions` - Novellas by factions (protected)
- `/order/anthologies/name` - Anthologies alphabetically (protected)
- `/order/anthologies/tags` - Anthologies by tags (protected)
- `/order/anthologies/factions` - Anthologies by factions (protected)
- `/import` - Import data (protected, admin only)
- `/timeline` - Chronological timeline (protected)

**API Routes:**
- `GET /api/books` - Get all series with books
- `GET /api/singles` - Get all singles
- `GET /api/novellas` - Get all novellas
- `GET /api/anthologies` - Get all anthologies
- `GET /api/reading` - Get series books progress
- `POST /api/reading` - Update series book progress
- `GET /api/reading/singles` - Get singles progress (returns book_id)
- `POST /api/reading/singles` - Update singles progress (uses single_id)
- `GET /api/reading/novellas` - Get novellas progress (returns book_id)
- `POST /api/reading/novellas` - Update novellas progress (uses novella_id)
- `GET /api/reading/anthologies` - Get anthologies progress (returns book_id)
- `POST /api/reading/anthologies` - Update anthologies progress (uses anthology_id)
- `GET /api/filters` - Get tags/factions
- `GET /api/import/list` - List importable files
- `POST /api/import` - Import files (all categories)
- `GET /api/import/check-admin` - Check admin status
- `GET /auth/callback` - OAuth callback

### `/components` - Reusable Components

**Layout Components:**
- `AppLayout` - Wraps pages, handles auth
- `Navbar` - Navigation with auth controls and category links
- `Footer` - Site footer
- `OrderTabs` - Tab navigation for order pages (By Series/Name/Tags/Factions)
- `DashboardTabs` - Tab navigation for dashboards (Series/Singles/Novellas/Anthologies)

**Feature Components:**
- `SeriesView` - Expandable series with books
- `Dashboard` - Statistics and progress for series books
- `BookDetailsModal` - Detailed book information modal

**Component Patterns:**
- All components are Client Components (`'use client'`)
- Use design system from `lib/design-system.ts`
- Import types from `lib/types.ts`

### `/data` - Source of Truth

**Structure:**
- `series/` - One JSON per series (76 series)
- `singles/` - One JSON per standalone novel (85 singles)
- `novellas/` - One JSON per novella (97 novellas)
- `anthologies/` - One JSON per anthology (129 anthologies)
- Each category has `_meta/` folder with:
  - `tags.json` - Canonical tags list
  - `factions.json` - Canonical factions list
- `series/_meta/` is the master source for normalization

**Workflow:**
1. Edit JSON files locally in appropriate category folder
2. Commit to git (version control)
3. Import via web interface (select specific files to import)
4. Database syncs with JSON
5. Tags/factions auto-normalize and update all `_meta/` folders

### `/lib` - Shared Code

**`design-system.ts`:**
- Color palette
- Tailwind class mappings
- Component styles
- Status icons

**`types.ts`:**
- TypeScript interfaces
- Shared type definitions
- Ensures type safety across app

**`supabase/`:**
- Client creation for browser/server
- Database query functions
- Reusable patterns

---

## Routing Architecture

### App Router

Next.js 15 App Router with file-based routing:

```
app/
├── page.tsx                           → /
├── dashboard/
│   ├── page.tsx                       → /dashboard (Series)
│   ├── singles/page.tsx               → /dashboard/singles
│   ├── novellas/page.tsx              → /dashboard/novellas
│   └── anthologies/page.tsx           → /dashboard/anthologies
├── order/
│   ├── series/
│   │   ├── page.tsx                   → /order/series
│   │   ├── name/page.tsx              → /order/series/name
│   │   ├── tags/page.tsx              → /order/series/tags
│   │   └── factions/page.tsx          → /order/series/factions
│   ├── singles/
│   │   ├── page.tsx                   → /order/singles (redirects to /name)
│   │   ├── name/page.tsx              → /order/singles/name
│   │   ├── tags/page.tsx              → /order/singles/tags
│   │   └── factions/page.tsx          → /order/singles/factions
│   ├── novellas/
│   │   ├── page.tsx                   → /order/novellas (redirects to /name)
│   │   ├── name/page.tsx              → /order/novellas/name
│   │   ├── tags/page.tsx              → /order/novellas/tags
│   │   └── factions/page.tsx          → /order/novellas/factions
│   └── anthologies/
│       ├── page.tsx                   → /order/anthologies (redirects to /name)
│       ├── name/page.tsx              → /order/anthologies/name
│       ├── tags/page.tsx              → /order/anthologies/tags
│       └── factions/page.tsx          → /order/anthologies/factions
└── api/
    ├── books/route.ts                 → /api/books
    ├── singles/route.ts               → /api/singles
    ├── novellas/route.ts              → /api/novellas
    ├── anthologies/route.ts           → /api/anthologies
    └── reading/
        ├── route.ts                   → /api/reading
        ├── singles/route.ts           → /api/reading/singles
        ├── novellas/route.ts          → /api/reading/novellas
        └── anthologies/route.ts       → /api/reading/anthologies
```

### Protected Routes

Routes requiring authentication:
- `/dashboard` and all dashboard tabs
- `/order/*` all order pages
- `/import` (admin only)
- `/timeline`
- `/api/reading/*` all reading progress endpoints
- `/api/import` (admin only)

Protection handled by:
1. `AppLayout` with `requireAuth={true}`
2. API routes check user authentication
3. Middleware manages session cookies

---

## Data Flow

### Read Flow (Books)

```
User → Page → fetch('/api/books')
             ↓
       API Route → Supabase → Database
             ↓
       JSON Response → State → UI
```

### Write Flow (Reading Progress)

```
User clicks book → cycleStatus()
                     ↓
              fetch('/api/reading', POST)
                     ↓
              API checks auth → Supabase upsert
                     ↓
              Success → re-fetch data → update UI
```

### Import Flow

```
User selects files → POST /api/import
                        ↓
                  Read JSON files from disk (series/singles/novellas/anthologies)
                        ↓
                  Normalize tags/factions against series/_meta/ (master)
                        ↓
                  Upsert to database (service role, bypasses RLS)
                        ↓
                  Update all _meta/ folders in all four categories
                        ↓
                  Return results (success count + errors)
```

---

## State Management

No global state management library (Redux, Zustand, etc.).

**Pattern:**
- Local state with `useState`
- Fetch data in `useEffect`
- Pass via props when needed
- Re-fetch after mutations

**Example:**
```typescript
const [books, setBooks] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchBooks();
}, []);

const fetchBooks = async () => {
  const data = await fetch('/api/books').then(r => r.json());
  setBooks(data.series);
  setLoading(false);
};
```

This works well for current scale (~80 books, simple data structure).

Consider React Query or SWR if:
- Caching becomes important
- Optimistic updates needed
- Complex data synchronization required

---

## Styling Approach

### Tailwind CSS

Utility-first CSS framework:

```tsx
<div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
  <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">
    Title
  </h2>
</div>
```

### Design System

Centralized tokens in `lib/design-system.ts`:

```tsx
import { styles } from '@/lib/design-system';

<div className={styles.card}>
  <h2 className={`text-2xl font-bold ${styles.textGold}`}>
    Title
  </h2>
</div>
```

### Why This Approach

- **Consistency:** Centralized colors and patterns
- **Flexibility:** Can override with Tailwind utilities
- **Performance:** Tailwind purges unused CSS
- **Type Safety:** Export from TypeScript file
- **No Runtime:** All styles compile-time

---

## TypeScript Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Key Settings:**
- `strict: true` - Full type checking
- `@/*` path alias - Import from root
- `jsx: preserve` - Let Next.js handle JSX

### Type Safety

All API responses, props, and state are typed:

```typescript
// lib/types.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  orderInSeries: number;
  faction?: string[];
  tags?: string[];
}

// Usage
const [books, setBooks] = useState<Book[]>([]);
```

---

## Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key]

# Google OAuth
GOOGLE_CLIENT_ID=[id].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-[secret]
```

### Public vs Private

**Public (`NEXT_PUBLIC_`):**
- Exposed to browser
- Use for client-side code
- Safe to share (anon key has RLS protection)

**Private:**
- Server-only
- Never sent to browser
- Keep secret (service role key bypasses RLS)

---

## Build & Development

### Commands

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Utilities
npm run lint         # Run ESLint
node scripts/extract-filters.js  # Update tag/faction lists
```

### Build Output

```
.next/
├── cache/           # Build cache
├── server/          # Server-side bundles
├── static/          # Static assets
└── trace            # Performance traces
```

### Environment Detection

```typescript
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
```

---

## Deployment

### Recommended: Vercel

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

**Benefits:**
- Automatic HTTPS
- Edge network (fast)
- Preview deployments
- Built for Next.js

### Alternative: Self-Hosted

```bash
npm run build
npm start
```

**Requirements:**
- Node.js 18+
- Set environment variables
- Configure reverse proxy (nginx)
- Enable HTTPS

---

## Performance Optimizations

### Current Optimizations

1. **Static Generation:** Most pages pre-rendered
2. **Image Optimization:** Next.js Image component (not currently used)
3. **Code Splitting:** Automatic per-route
4. **CSS Purging:** Tailwind removes unused styles
5. **Minimal Dependencies:** Keep bundle small

### Future Optimizations

- **React Server Components:** Move more to server
- **Streaming SSR:** For faster initial load
- **CDN Caching:** Cache API responses
- **Database Indexes:** Add if queries slow
- **Pagination:** When books > 500

---

## Testing Strategy

### Current State

No automated tests (MVP phase).

### Future Testing

**Unit Tests (Jest):**
- Utility functions
- Component logic
- Type transformations

**Integration Tests (Playwright):**
- Auth flow
- Import process
- Status updates

**E2E Tests:**
- Critical user flows
- Payment flows (if added)

For now, manual testing + TypeScript catches most issues.

---

## Monitoring & Logging

### Current Logging

```typescript
console.log()   // Development only
console.error() // Errors logged to console
toast.error()   // User-facing errors
```

### Future Monitoring

Consider adding:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Usage metrics
- **Supabase Dashboard** - Database monitoring

---

## Contributing Workflow

### Making Changes

1. Create feature branch
2. Make changes locally
3. Test thoroughly
4. Commit with clear message
5. Push and create PR
6. Deploy preview
7. Merge to main

### Code Style

- Use Prettier (format on save)
- Follow ESLint rules
- Write clear commit messages
- Add comments for complex logic
- Update documentation

---

## Common Patterns

### Fetching Data

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const response = await fetch('/api/books');
    const result = await response.json();
    setData(result);
  } catch (error) {
    console.error('Failed to fetch:', error);
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

### Protected Page

```typescript
export default function ProtectedPage() {
  return (
    <AppLayout requireAuth={true}>
      {/* Page content */}
    </AppLayout>
  );
}
```

### API Route

```typescript
export async function GET(request: Request) {
  try {
    // Check auth if needed
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data
    const data = await supabase.from('table').select('*');

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## Maintenance

### Regular Tasks

- **Weekly:** Check for dependency updates
- **Monthly:** Review error logs
- **Quarterly:** Review and update documentation
- **Yearly:** Major dependency upgrades

### Backup Strategy

- **Code:** Git (GitHub)
- **Data:** JSON files in repo
- **Database:** Supabase automatic backups
- **User Data:** Export via Supabase dashboard

---

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Internal Docs

- `.claude/ADDING_BOOKS.md` - How to add books
- `.claude/API_ENDPOINTS.md` - API reference
- `.claude/AUTHENTICATION.md` - Auth guide
- `.claude/DATABASE.md` - Database schema
- `.claude/DESIGN_SYSTEM.md` - Design guide

---

This project structure emphasizes simplicity, maintainability, and clear separation of concerns. Each directory has a single responsibility, making it easy for AI assistants or new developers to understand and contribute.
