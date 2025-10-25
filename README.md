# Codex Librarium

A comprehensive web application for tracking your progress through the vast Warhammer 40,000 Black Library collection. Built with Next.js 15, TypeScript, and Supabase.

## Features

### 📚 Extensive Book Collection
- **76 complete series** with over **387 books total**
- **85 standalone novels**
- **97 novellas**
- **129 anthologies and collections**
- Major series including:
  - The Horus Heresy (54 books)
  - Siege of Terra (8 books)
  - Dawn of Fire (9 books, ongoing)
  - Gaunt's Ghosts (16 books)
  - Eisenhorn, Ravenor, and Bequin trilogies
  - Ultramarines, Night Lords, Space Wolves, and more
  - Xenos-focused series: Path of the Eldar, Twice-Dead King, Phoenix Lords

### 🎯 Smart Organization
- **Four Book Categories** - Separate navigation for Series, Singles, Novellas, and Anthologies
- **Multiple Sorting Options per Category** - Each category supports browsing:
  - **By Series** (Series only) - Follow Black Library publication order
  - **By Name** - Alphabetically sorted complete catalog
  - **By Tags** - Find books by themes (e.g., "Primarchs", "Siege", "Investigation")
  - **By Factions** - Filter by your favorite armies and factions
- **Pagination** - 20 items per page for easy browsing
- **Search Functionality** - Quick filtering within tags and factions views

### 📊 Progress Tracking
- Three reading states: Unread, Reading, Completed
- **Tabbed Dashboard** - Separate dashboards for Series, Singles, Novellas, and Anthologies
- Visual progress indicators and completion rates
- Statistics for each category (Total, Completed, Reading, Unread)
- **Collapsible Sections** - Currently Reading and Completed Books sections with expand/collapse functionality
- **Rating and Notes** - Add ratings (1-5 stars) and personal notes for Singles, Novellas, and Anthologies
- Real-time sync across all your devices

### 🎨 Premium UI/UX
- Warhammer-themed dark interface with Imperial Gold accents
- Detailed book modals with all metadata
- Responsive design for desktop and mobile
- Smooth animations and transitions

### 🔐 Authentication & Security
- Google OAuth via Supabase Auth
- Row-level security for user data
- Admin-only import functionality
- Secure API endpoints

### 📝 Book Requests
- **User Requests** - Any authenticated user can request books to be added to the library
- **Request Management** - Four status categories:
  - **Requests** (Pending) - New requests awaiting admin review
  - **Approved** - Requests accepted and fulfilled
  - **Waitlist** - Requests acknowledged but not yet ready to add
  - **Refused** - Requests rejected with admin-provided reasons
- **Filtering** - Sort requests by newest or oldest
- **Admin-Only Status Changes** - Only admins can move requests between statuses
- **Refusal Comments** - Required explanations when refusing requests, with edit tracking

### ⚙️ Admin Features
- JSON-based book import system with file selection
- Support for importing Series, Singles, Novellas, and Anthologies
- Automatic tag and faction normalization
- Folder-based organization (_meta folders) for easy management
- Real-time updates to canonical tag/faction lists across all categories
- Selective import (choose specific files to import)
- Book request management with status updates and refusal comments

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Styling:** Tailwind CSS
- **UI Components:** Custom design system
- **Deployment Ready:** Vercel-optimized

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/codex-librarium.git
cd codex-librarium
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAILS=your-admin-email@example.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── books/         # Series books API
│   │   ├── singles/       # Singles API
│   │   ├── novellas/      # Novellas API
│   │   ├── anthologies/   # Anthologies API
│   │   ├── reading/       # Reading progress APIs
│   │   │   ├── route.ts   # Series progress (GET/POST)
│   │   │   ├── singles/   # Singles progress (GET/POST)
│   │   │   ├── novellas/  # Novellas progress (GET/POST)
│   │   │   └── anthologies/ # Anthologies progress (GET/POST)
│   │   ├── requests/      # Book requests APIs
│   │   │   ├── route.ts   # List/create requests (GET/POST)
│   │   │   └── [id]/      # Update/delete request (PATCH/DELETE)
│   │   └── import/        # Import system APIs
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.tsx       # Series dashboard
│   │   ├── singles/       # Singles dashboard
│   │   ├── novellas/      # Novellas dashboard
│   │   ├── anthologies/   # Anthologies dashboard
│   │   └── requests/      # Book requests dashboard
│   ├── import/            # Admin import page
│   ├── order/             # Book browsing pages
│   │   ├── series/        # Series books
│   │   │   ├── page.tsx   # Redirect to /series
│   │   │   ├── series/    # Browse by series
│   │   │   ├── name/      # Browse by name
│   │   │   ├── tags/      # Browse by tags
│   │   │   └── factions/  # Browse by factions
│   │   ├── singles/       # Single novels
│   │   │   ├── page.tsx   # Redirect to /name
│   │   │   ├── name/      # Browse by name
│   │   │   ├── tags/      # Browse by tags
│   │   │   └── factions/  # Browse by factions
│   │   ├── novellas/      # Novellas
│   │   │   ├── page.tsx   # Redirect to /name
│   │   │   ├── name/      # Browse by name
│   │   │   ├── tags/      # Browse by tags
│   │   │   └── factions/  # Browse by factions
│   │   └── anthologies/   # Anthologies
│   │       ├── page.tsx   # Redirect to /name
│   │       ├── name/      # Browse by name
│   │       ├── tags/      # Browse by tags
│   │       └── factions/  # Browse by factions
│   └── auth/              # Authentication callbacks
├── components/            # React components
│   ├── AppLayout.tsx      # Main layout wrapper
│   ├── BookDetailsModal.tsx
│   ├── DashboardTabs.tsx  # Dashboard category tabs
│   ├── OrderTabs.tsx      # Sorting tabs
│   ├── Navbar.tsx
│   └── SeriesView.tsx
├── lib/                   # Utilities and types
│   ├── supabase/          # Supabase client setup
│   ├── design-system.ts   # Theming and styles
│   └── types.ts           # TypeScript definitions
├── data/                  # Book data
│   ├── series/            # Series JSON files
│   │   └── _meta/         # tags.json, factions.json
│   ├── singles/           # Singles JSON files
│   │   └── _meta/         # tags.json, factions.json
│   ├── novellas/          # Novellas JSON files
│   │   └── _meta/         # tags.json, factions.json
│   └── anthologies/       # Anthologies JSON files
│       └── _meta/         # tags.json, factions.json
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
└── .claude/               # Documentation
    ├── DESIGN_SYSTEM.md
    ├── DATABASE.md
    ├── API_ENDPOINTS.md
    └── AUTHENTICATION.md
```

## Database Setup

Run the migrations in the `supabase/migrations/` directory to set up the database:

```bash
npx supabase db push
```

The database includes:
- **Book Tables**: `series`, `series_books`, `singles`, `novellas`, `anthologies`
- **Reading Progress Tables**: `reading_progress_series_books`, `reading_progress_singles`, `reading_progress_novellas`, `reading_progress_anthologies`
- **Book Requests Table**: `book_requests` - User-submitted book requests with admin management
- **Row Level Security (RLS)** on all tables
- **Indexes** for optimal query performance

See `supabase/migrations/004_complete_fresh_schema.sql` for the main schema and `005_add_book_requests.sql` for the book requests feature.

## Adding Books

Books are stored as JSON files in four category directories:

- `data/series/` - Series with books
- `data/singles/` - Standalone novels
- `data/novellas/` - Novellas
- `data/anthologies/` - Anthologies and collections

To add books:

1. Create a new JSON file in the appropriate category folder
2. Follow the schema for that category
3. Tags and factions will auto-normalize against canonical lists in `_meta/` folders

For admin access, use the `/import` page to selectively import JSON files.

## Documentation

Comprehensive documentation is available in the `.claude/` directory:

- `DESIGN_SYSTEM.md` - Colors, typography, component patterns
- `DATABASE.md` - Schema, RLS policies, queries
- `API_ENDPOINTS.md` - API reference and examples
- `AUTHENTICATION.md` - Auth flow and security
- `PROJECT_STRUCTURE.md` - Architecture overview
- `ADDING_BOOKS.md` - Book import guide

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/codex-librarium)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_EMAILS`

## Contributing

Contributions are welcome! To add new book series:

1. Fork the repository
2. Create a new series JSON file following the schema
3. Test locally
4. Submit a pull request

## License

This is a personal project for tracking Warhammer 40,000 book collections. All Warhammer 40,000 intellectual property belongs to Games Workshop.

## Acknowledgments

- Black Library for the incredible Warhammer 40,000 book collection
- Games Workshop for the Warhammer 40,000 universe
- The community for keeping track of reading orders

---

**In the grim darkness of the far future, there are only books to track.**
