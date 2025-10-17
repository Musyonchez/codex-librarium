const fs = require('fs');
const path = require('path');

// Read all series JSON files
const seriesDir = path.join(__dirname, '../data/series');
const files = fs.readdirSync(seriesDir).filter(f => f.endsWith('.json'));

const tagsSet = new Set();
const factionsSet = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(seriesDir, file), 'utf-8');
  const series = JSON.parse(content);

  series.books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => tagsSet.add(tag));
    }
    if (book.faction) {
      book.faction.forEach(faction => factionsSet.add(faction));
    }
  });
});

// Sort alphabetically
const tags = Array.from(tagsSet).sort();
const factions = Array.from(factionsSet).sort();

// Write to files
fs.writeFileSync(
  path.join(__dirname, '../data/tags.json'),
  JSON.stringify(tags, null, 2) + '\n'
);

fs.writeFileSync(
  path.join(__dirname, '../data/factions.json'),
  JSON.stringify(factions, null, 2) + '\n'
);

console.log(`Extracted ${tags.length} unique tags`);
console.log(`Extracted ${factions.length} unique factions`);
