# Codex Librarium

A comprehensive web application for tracking your progress through the vast Warhammer 40,000 Black Library collection. Built with Next.js 15, TypeScript, and Supabase.

## Features

### 📚 Extensive Book Collection
- **32 complete series** with over **150+ books**
- Major series including:
  - The Horus Heresy (54 books)
  - Siege of Terra (8 books)
  - Dawn of Fire (9 books, ongoing)
  - Gaunt's Ghosts (16 books)
  - Eisenhorn, Ravenor, and Bequin trilogies
  - Ultramarines, Night Lords, Space Wolves, and more
  - Xenos-focused series: Path of the Eldar, Twice-Dead King, Phoenix Lords

### 🎯 Smart Organization
- **Browse by Series** - Follow Black Library publication order
- **Browse by Name** - Alphabetically sorted complete catalog
- **Browse by Tags** - Find books by themes (e.g., "Primarchs", "Siege", "Investigation")
- **Browse by Factions** - Filter by your favorite armies and factions

### 📊 Progress Tracking
- Three reading states: Unread, Reading, Completed
- Visual progress indicators for each series
- Dashboard with statistics and series completion rates
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

### ⚙️ Admin Features
- JSON-based book import system
- Automatic tag and faction normalization
- Folder-based organization for easy management
- Real-time updates to canonical tag/faction lists

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
│   ├── dashboard/         # Dashboard page
│   ├── import/            # Admin import page
│   ├── order/             # Book browsing pages
│   └── auth/              # Authentication callbacks
├── components/            # React components
│   ├── AppLayout.tsx      # Main layout wrapper
│   ├── BookDetailsModal.tsx
│   ├── Navbar.tsx
│   └── SeriesView.tsx
├── lib/                   # Utilities and types
│   ├── supabase/          # Supabase client setup
│   ├── design-system.ts   # Theming and styles
│   └── types.ts           # TypeScript definitions
├── data/                  # Book data
│   ├── series/            # Individual series JSON files
│   ├── tags.json          # Canonical tag list
│   └── factions.json      # Canonical faction list
└── .claude/               # Documentation
    ├── DESIGN_SYSTEM.md
    ├── DATABASE.md
    ├── API_ENDPOINTS.md
    └── AUTHENTICATION.md
```

## Database Setup

The app requires two Supabase tables:

### `reading_tracker` table
```sql
CREATE TABLE reading_tracker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  book_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unread', 'reading', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
```

See `.claude/DATABASE.md` for complete schema and RLS policies.

## Adding Books

Books are stored as JSON files in `data/series/`. To add a new series:

1. Create a new JSON file in `data/series/`
2. Follow the schema in `.claude/ADDING_BOOKS.md`
3. Tags and factions will auto-normalize against canonical lists

For admin access, use the `/import` page to upload JSON files directly.

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
