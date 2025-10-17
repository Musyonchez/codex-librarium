# Adding Books to the Tracker

This guide explains how to add new books or create new series in the Warhammer 40K Reading Tracker.

## Overview

Books are stored as JSON files in the `data/series/` directory. Each series has its own JSON file. After editing the JSON files, you import them through the web interface to sync changes to the database.

## Tag and Faction Consistency

The system maintains canonical lists of all tags and factions:
- `data/tags.json` - All valid tags (107 tags, alphabetically sorted)
- `data/factions.json` - All valid factions (28 factions, alphabetically sorted)

**How it works:**
- When importing books, the system automatically normalizes tag/faction names (case-insensitive matching)
- If you use "blood angels" instead of "Blood Angels", it will auto-correct to the canonical version
- New tags/factions are automatically added to these files during import and sorted
- This prevents duplicates like "Space Wolves", "space wolves", "Space wolves" appearing as different factions

**Best Practice:**
- Check `data/tags.json` and `data/factions.json` before adding new tags/factions
- Use existing tags/factions when possible to maintain consistency
- The import process will handle minor variations (case, spacing) automatically
- If you add a genuinely new tag/faction, it will be automatically added to the canonical list

---

## Adding Books to an Existing Series

### Step 1: Edit the Series JSON File

Navigate to `data/series/` and open the appropriate series file:
- `horus-heresy.json` - The Horus Heresy series
- `siege-of-terra.json` - The Siege of Terra series
- `primarchs.json` - The Primarchs series

### Step 2: Add the Book Entry

Add a new book object to the `books` array following this format:

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

### Field Descriptions:

- **id** (required): Unique identifier
  - Format: `{series-prefix}-{number}`
  - Examples: `hh-55`, `sot-11`, `p-15`
  - Must be unique across all books

- **title** (required): Full book title
  - Example: `"The Solar War"`

- **author** (required): Author name
  - For anthologies, use `"Various"`

- **orderInSeries** (required): Position in reading order
  - Must be a number
  - Determines display order in the UI

- **faction** (optional): Array of factions featured in the book
  - Examples: `["Space Wolves"]`, `["Ultramarines", "Word Bearers"]`
  - Use proper faction names:
    - Space Marine Legions: `"Imperial Fists"`, `"Blood Angels"`, etc.
    - Imperial Forces: `"Adeptus Mechanicus"`, `"Custodes"`, `"Officio Assassinorum"`
    - Others: `"Collegia Titanica"`, `"Imperial Army"`, `"Various"`
  - For anthologies or multi-faction books: `["Various"]`

- **tags** (optional): Array of keywords/themes
  - Examples: `["Terra", "Siege", "Primarchs"]`
  - Used for searching and categorization

### Example - Adding a Book:

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
    },
    {
      "id": "hh-55",
      "title": "The New Book",
      "author": "New Author",
      "orderInSeries": 55,
      "faction": ["Death Guard", "White Scars"],
      "tags": ["Battle", "Betrayal"]
    }
  ]
}
```

### Step 3: Import to Database

1. Open the website and sign in
2. Click on your username in the navbar
3. Select "Import Books" from the dropdown
4. Click "Import from JSON Files" button
5. Review the import results
6. Your new book will now appear on the website!

---

## Creating a New Series

### Step 1: Create a New JSON File

Create a new file in `data/series/` with a descriptive name:
- Use kebab-case: `war-of-the-beast.json`
- Name should match the series ID

### Step 2: Add Series Structure

Use this template:

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

### Series Field Descriptions:

- **id** (required): Unique series identifier
  - Use kebab-case
  - Example: `"war-of-the-beast"`

- **name** (required): Display name of the series
  - Example: `"The War of the Beast"`

- **description** (required): Brief description of the series
  - One or two sentences
  - Example: `"The Imperium faces its greatest threat since the Horus Heresy"`

- **books** (required): Array of book objects
  - Follow the book format described above

### Step 3: Choose Book ID Prefix

Select a consistent prefix for all books in the series:
- `hh-` = Horus Heresy
- `sot-` = Siege of Terra
- `p-` = Primarchs
- `wotb-` = War of the Beast (example)

### Step 4: Import to Database

Follow the same import steps as adding books (see above).

---

## Best Practices

### ID Conventions
- Keep IDs short and descriptive
- Use consistent prefixes per series
- Number books sequentially: `01`, `02`, `03` (or just `1`, `2`, `3`)

### Order Numbers
- Use the official Black Library publication order
- For simultaneous releases, order by preference
- Leave gaps if you plan to add books later

### Factions
- Use official faction names
- Include all major factions featured in the book
- Use `"Various"` for anthologies with multiple factions
- Avoid using `"None"` - find an appropriate faction instead

### Tags
- Be consistent with existing tags
- Use title case: `"Great Crusade"` not `"great crusade"`
- 3-5 tags per book is ideal
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
- Each book ID must be unique across ALL series
- Check if the ID already exists in other series files

**Invalid JSON**
- Missing commas between objects
- Trailing commas (not allowed in JSON)
- Unmatched brackets or braces
- Use a JSON validator or code editor with JSON support

**Import Failed**
- Check the import results page for specific error messages
- Verify all required fields are present
- Ensure orderInSeries is a number, not a string

### Validation Checklist

Before importing, verify:
- [ ] All required fields are present
- [ ] IDs are unique
- [ ] orderInSeries values are numbers
- [ ] JSON is valid (no syntax errors)
- [ ] Faction names are consistent with existing data
- [ ] File is saved in `data/series/` directory

---

## Example: Complete New Series

Here's a complete example of adding a new series:

**File: `data/series/beast-arises.json`**

```json
{
  "id": "beast-arises",
  "name": "The Beast Arises",
  "description": "A 12-book series set 1,500 years after the Horus Heresy, as the Imperium faces a massive Ork invasion",
  "books": [
    {
      "id": "ba-01",
      "title": "I Am Slaughter",
      "author": "Dan Abnett",
      "orderInSeries": 1,
      "faction": ["Imperial Fists", "Orks"],
      "tags": ["Terra", "Invasion", "Magneric"]
    },
    {
      "id": "ba-02",
      "title": "Predator, Prey",
      "author": "Rob Sanders",
      "orderInSeries": 2,
      "faction": ["Iron Warriors", "Fists Exemplar"],
      "tags": ["Space Marines", "Orks", "Investigation"]
    }
  ]
}
```

After creating this file, import it through the web interface and it will appear as a new series!

---

## Workflow Summary

```bash
# 1. Edit or create JSON file
code data/series/horus-heresy.json

# 2. Add/modify book data
# (Use the format examples above)

# 3. Save the file

# 4. Go to website
# - Sign in
# - Click username → "Import Books"
# - Click "Import from JSON Files"

# 5. Verify import succeeded
# Check the results page for any errors

# 6. View your changes
# Navigate to the series page to see the new books
```

---

## Additional Notes

- **Version Control**: JSON files are tracked in git, so you can see history of changes
- **Backup**: JSON files serve as your master data backup
- **Bulk Edits**: Edit multiple books/series at once, then import all changes together
- **User Progress**: User reading progress is stored separately and won't be affected by imports
- **Upserts**: Importing existing books will update them, not duplicate them

For questions or issues, check the import results page for detailed error messages.
