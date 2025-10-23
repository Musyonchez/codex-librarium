# Adding Books to the Tracker

This guide explains how to add books to the Warhammer 40K Reading Tracker across all four book categories: Series, Singles, Novellas, and Anthologies.

## Overview

Books are stored as JSON files in four category directories:
- `data/series/` - Series with multiple books (76 series)
- `data/singles/` - Standalone novels (85 singles)
- `data/novellas/` - Novella-length stories (97 novellas)
- `data/anthologies/` - Collections and omnibus editions (129 anthologies)

After editing JSON files, you import them through the web interface (`/import` page) to sync changes to the database.

## Quick Start Checklist

When adding or editing books:

1. ✏️ Edit the JSON file(s) in the appropriate `data/` directory
2. ✅ **Run validation:** `npm run validate-data`
3. 🔧 Fix any duplicate ID errors reported
4. 📤 Import via the web interface at `/import`
5. 🎉 Verify books appear correctly

**The validation step is critical** - it prevents database conflicts from duplicate IDs that would cause series to show "NaN%" or books to fail importing.

---

## Tag and Faction Consistency

The system maintains canonical lists of all tags and factions in `_meta/` folders:

**Master Source:**
- `data/series/_meta/tags.json` - Master canonical tags list
- `data/series/_meta/factions.json` - Master canonical factions list

**Category-Specific (Auto-Updated):**
- `data/singles/_meta/tags.json` & `factions.json`
- `data/novellas/_meta/tags.json` & `factions.json`
- `data/anthologies/_meta/tags.json` & `factions.json`

**How it works:**
- `series/_meta/` is the master source for normalization
- When importing books, the system automatically normalizes tag/faction names (case-insensitive matching)
- If you use "blood angels" instead of "Blood Angels", it will auto-correct to the canonical version
- New tags/factions are automatically added to ALL `_meta/` folders during import and sorted
- This prevents duplicates like "Space Wolves", "space wolves", "Space wolves" appearing as different factions
- All four category `_meta/` folders are kept in sync

**Best Practice:**
- Check `data/series/_meta/tags.json` and `factions.json` before adding new tags/factions
- Use existing tags/factions when possible to maintain consistency
- The import process will handle minor variations (case, spacing) automatically
- If you add a genuinely new tag/faction, it will be automatically added to all canonical lists

---

## Category 1: Series Books

### Adding Books to an Existing Series

#### Step 1: Edit the Series JSON File

Navigate to `data/series/` and open the appropriate series file:
- `horus-heresy.json` - The Horus Heresy series
- `siege-of-terra.json` - The Siege of Terra series
- `primarchs.json` - The Primarchs series
- etc.

#### Step 2: Add the Book Entry

Add a new book object to the `books` array:

```json
{
  "id": "hh-55",
  "title": "Book Title Here",
  "author": "Author Name",
  "orderInSeries": 55,
  "faction": ["Faction 1", "Faction 2"],
  "tags": ["Tag 1", "Tag 2", "Tag 3"]
}
```

**Field Descriptions:**

- **id** (required): Unique identifier
  - Format: `{series-prefix}-{number}`
  - Examples: `hh-55`, `sot-11`, `p-15`
  - Must be unique across all books

- **title** (required): Full book title
  - Example: `"The Solar War"`

- **author** (required): Author name
  - For anthologies within series, use `"Various"`

- **orderInSeries** (required): Position in reading order
  - Must be a number
  - Determines display order in the UI

- **faction** (optional): Array of factions featured
  - Examples: `["Space Wolves"]`, `["Ultramarines", "Word Bearers"]`
  - Use `["Various"]` for multi-faction books

- **tags** (optional): Array of keywords/themes
  - Examples: `["Terra", "Siege", "Primarchs"]`
  - Used for searching and categorization

#### Step 3: Import to Database

1. Open the website and sign in
2. Navigate to `/import` page
3. Select files to import from the "Series" folder
4. Click "Import Selected Files"
5. Review the import results

---

### Creating a New Series

#### Step 1: Create a New JSON File

Create a new file in `data/series/` with a descriptive name:
- Use kebab-case: `war-of-the-beast.json`
- Name should match the series ID

#### Step 2: Add Series Structure

```json
{
  "id": "war-of-the-beast",
  "name": "The War of the Beast",
  "description": "Series description goes here",
  "books": [
    {
      "id": "wotb-01",
      "title": "First Book Title",
      "author": "Author Name",
      "orderInSeries": 1,
      "faction": ["Imperial Fists"],
      "tags": ["Orks", "Terra"]
    },
    {
      "id": "wotb-02",
      "title": "Second Book Title",
      "author": "Author Name",
      "orderInSeries": 2,
      "faction": ["Iron Warriors"],
      "tags": ["Orks", "Space"]
    }
  ]
}
```

**Series Field Descriptions:**

- **id** (required): Unique series identifier (kebab-case)
- **name** (required): Display name of the series
- **description** (required): Brief description (1-2 sentences)
- **books** (required): Array of book objects

#### Step 3: Import to Database

Follow the import steps above to add your new series.

---

## Category 2: Singles (Standalone Novels)

### Adding a Single Novel

#### Step 1: Create a JSON File

Create a new file in `data/singles/` directory:
- Use kebab-case: `space-marine.json`
- Name should match the book ID

#### Step 2: Add Book Data

Singles do NOT have `orderInSeries`, `series`, or `publicationYear` fields. Use this format:

```json
{
  "id": "space-marine",
  "title": "Space Marine",
  "author": "Ian Watson",
  "faction": ["Space Marines", "Inquisition"],
  "tags": ["Inquisition War", "Space Marines", "Classic"]
}
```

**Field Descriptions:**

- **id** (required): Unique identifier
  - Format: Kebab-case matching filename
  - Examples: `space-marine`, `fire-caste`, `valdor-birth-of-the-imperium`
  - Must be unique across all singles

- **title** (required): Full book title
  - Example: `"Space Marine"`

- **author** (required): Author name
  - Example: `"Ian Watson"`

- **faction** (optional): Array of factions featured
  - Examples: `["Space Marines"]`, `["Astra Militarum", "Orks"]`

- **tags** (optional): Array of keywords/themes
  - Examples: `["Inquisition War", "Classic", "First Contact"]`

#### Step 3: Import to Database

1. Navigate to `/import` page
2. Select files to import from the "Singles" folder
3. Click "Import Selected Files"
4. Review the import results

**Example - Complete Single:**

```json
{
  "id": "fire-caste",
  "title": "Fire Caste",
  "author": "Peter Fehervari",
  "faction": ["Astra Militarum", "T'au Empire"],
  "tags": ["T'au", "War", "Psychological Horror", "Dark Imperium"]
}
```

---

## Category 3: Novellas

### Adding a Novella

#### Step 1: Create a JSON File

Create a new file in `data/novellas/` directory:
- Use kebab-case: `aurelian.json`
- Name should match the novella ID

#### Step 2: Add Novella Data

Novellas use the same format as singles (no `orderInSeries`):

```json
{
  "id": "aurelian",
  "title": "Aurelian",
  "author": "Aaron Dembski-Bowden",
  "faction": ["Word Bearers", "Chaos", "Daemons"],
  "tags": ["Lorgar", "Word Bearers", "Horus Heresy", "Chaos"]
}
```

**Field Descriptions:**

Same as singles category:
- **id** (required): Unique identifier (kebab-case)
- **title** (required): Full novella title
- **author** (required): Author name
- **faction** (optional): Array of factions featured
- **tags** (optional): Array of keywords/themes

#### Step 3: Import to Database

1. Navigate to `/import` page
2. Select files to import from the "Novellas" folder
3. Click "Import Selected Files"
4. Review the import results

**Example - Complete Novella:**

```json
{
  "id": "the-purge",
  "title": "The Purge",
  "author": "Anthony Reynolds",
  "faction": ["Death Guard", "World Eaters"],
  "tags": ["Death Guard", "World Eaters", "Horus Heresy", "Betrayal"]
}
```

---

## Category 4: Anthologies

### Adding an Anthology

#### Step 1: Create a JSON File

Create a new file in `data/anthologies/` directory:
- Use kebab-case: `let-the-galaxy-burn.json`
- Name should match the anthology ID

#### Step 2: Add Anthology Data

Anthologies use the same format as singles and novellas:

```json
{
  "id": "let-the-galaxy-burn",
  "title": "Let the Galaxy Burn",
  "author": "Various",
  "faction": ["Various"],
  "tags": ["Anthology", "Various", "Classic"]
}
```

**Field Descriptions:**

Same as singles/novellas:
- **id** (required): Unique identifier (kebab-case)
- **title** (required): Full anthology title
- **author** (required): Usually `"Various"` for collections
- **faction** (optional): Usually `["Various"]` for multi-faction collections
- **tags** (optional): Always include `"Anthology"` tag

#### Step 3: Import to Database

1. Navigate to `/import` page
2. Select files to import from the "Anthologies" folder
3. Click "Import Selected Files"
4. Review the import results

**Example - Complete Anthology:**

```json
{
  "id": "sons-of-the-emperor",
  "title": "Sons of the Emperor",
  "author": "Various",
  "faction": ["Various", "Space Marines"],
  "tags": ["Anthology", "Space Marines", "Horus Heresy", "Primarchs"]
}
```

---

## Import Workflow

### Using the Import Interface

1. **Navigate to Import Page**
   - Sign in as admin
   - Go to `/import`

2. **Select Files to Import**
   - Four folder sections: Series, Singles, Novellas, Anthologies
   - Check individual files you want to import
   - You can import multiple files from multiple categories at once

3. **Import Files**
   - Click "Import Selected Files" button
   - Wait for processing

4. **Review Results**
   - Success message shows counts: `"Import completed: 2 series, 64 books, 5 singles, 3 novellas, 2 anthologies"`
   - Error messages list any issues
   - Tags and factions are automatically normalized and updated in all `_meta/` folders

### What Happens During Import

1. **Read JSON Files** - Reads selected files from disk
2. **Normalize Tags/Factions** - Matches against `series/_meta/` (master source)
3. **Upsert to Database** - Inserts new or updates existing records
4. **Update Meta Files** - Updates ALL `_meta/` folders with new canonical values
5. **Return Results** - Shows success count and any errors

---

## Best Practices

### ID Conventions

**Series Books:**
- Use consistent prefixes: `hh-`, `sot-`, `p-`, etc.
- Number sequentially: `hh-01`, `hh-02`, `hh-03`

**Singles/Novellas/Anthologies:**
- Use kebab-case matching book title
- Examples: `space-marine`, `aurelian`, `let-the-galaxy-burn`

### Factions

- Use official faction names from `series/_meta/factions.json`
- Include all major factions featured
- Use `"Various"` for anthologies with multiple factions
- Avoid using `"None"` - find an appropriate faction instead

### Tags

- Check `series/_meta/tags.json` for existing tags
- Use title case: `"Great Crusade"` not `"great crusade"`
- 3-5 tags per book is ideal
- For anthologies, always include `"Anthology"` tag
- Include:
  - Major characters/Primarchs
  - Key locations
  - Major battles/events
  - Story themes

### JSON Formatting

- Use 2-space indentation
- Keep array items on separate lines
- Maintain consistent structure across files
- Validate JSON before importing (most code editors do this automatically)

---

## Troubleshooting

### Common Errors

**Duplicate ID Error**
- Each book ID must be unique within its category
- Check if the ID already exists

**Invalid JSON**
- Missing commas between objects
- Trailing commas (not allowed in JSON)
- Unmatched brackets or braces
- Use a JSON validator or code editor with JSON support

**Import Failed**
- Check the import results page for specific error messages
- Verify all required fields are present (`id`, `title`, `author`)
- For series: ensure `orderInSeries` is a number, not a string

### Validation Checklist

Before importing, verify:
- [ ] All required fields are present
- [ ] IDs are unique within category
- [ ] For series: `orderInSeries` values are numbers
- [ ] JSON is valid (no syntax errors)
- [ ] Faction names are consistent with existing data
- [ ] Tags use proper capitalization
- [ ] File is saved in correct category directory

**IMPORTANT: Always run the validation script after editing JSON files:**

```bash
npm run validate-data
```

This script will:
- ✅ Check for duplicate book IDs within each category (series_books, singles, novellas, anthologies)
- ✅ Verify all books have valid IDs
- ⚠️ Warn if the same ID is used across different categories (not an error but may cause confusion)
- ✅ Display total counts for each category

**Example output:**
```
🔍 Validating IDs across all categories...

✅ All IDs are valid and unique within their categories!
   Series books: 336
   Singles: 85
   Novellas: 96
   Anthologies: 129
   Total unique IDs: 646
```

If the validation fails, you'll see detailed error messages showing which IDs are duplicated and where they appear. Fix these issues before importing to prevent database conflicts.

---

## Category-Specific Summary

| Category | Location | Required Fields | Optional Fields | Example ID |
|----------|----------|----------------|----------------|------------|
| **Series** | `data/series/` | id, title, author, orderInSeries | faction, tags | `hh-01` |
| **Singles** | `data/singles/` | id, title, author | faction, tags | `space-marine` |
| **Novellas** | `data/novellas/` | id, title, author | faction, tags | `aurelian` |
| **Anthologies** | `data/anthologies/` | id, title, author | faction, tags | `let-the-galaxy-burn` |

**Key Differences:**
- Series books have `orderInSeries` field
- Singles, novellas, and anthologies do NOT have `orderInSeries`, `series`, or `publicationYear`
- Anthologies usually use `"Various"` for author and faction

---

## Complete Examples

### Series Book

**File: `data/series/horus-heresy.json`**
```json
{
  "id": "horus-heresy",
  "name": "The Horus Heresy",
  "description": "The galaxy-spanning civil war that tore the Imperium apart",
  "books": [
    {
      "id": "hh-01",
      "title": "Horus Rising",
      "author": "Dan Abnett",
      "orderInSeries": 1,
      "faction": ["Luna Wolves/Sons of Horus"],
      "tags": ["Great Crusade", "Horus", "Loken"]
    }
  ]
}
```

### Single Novel

**File: `data/singles/space-marine.json`**
```json
{
  "id": "space-marine",
  "title": "Space Marine",
  "author": "Ian Watson",
  "faction": ["Space Marines", "Inquisition"],
  "tags": ["Inquisition War", "Space Marines", "Classic"]
}
```

### Novella

**File: `data/novellas/aurelian.json`**
```json
{
  "id": "aurelian",
  "title": "Aurelian",
  "author": "Aaron Dembski-Bowden",
  "faction": ["Word Bearers", "Chaos", "Daemons"],
  "tags": ["Lorgar", "Word Bearers", "Horus Heresy", "Chaos"]
}
```

### Anthology

**File: `data/anthologies/let-the-galaxy-burn.json`**
```json
{
  "id": "let-the-galaxy-burn",
  "title": "Let the Galaxy Burn",
  "author": "Various",
  "faction": ["Various"],
  "tags": ["Anthology", "Various", "Classic"]
}
```

---

## Additional Notes

- **Version Control**: JSON files are tracked in git, so you can see history of changes
- **Backup**: JSON files serve as your master data backup
- **Bulk Edits**: Edit multiple books/series at once, then import all changes together
- **User Progress**: User reading progress is stored separately and won't be affected by imports
- **Upserts**: Importing existing books will update them, not duplicate them
- **Selective Import**: Only import files you've changed, no need to import everything
- **Cross-Category Consistency**: Tags and factions are automatically kept consistent across all four categories

For questions or issues, check the import results page for detailed error messages.
