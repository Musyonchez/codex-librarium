#!/usr/bin/env node

/**
 * Validation script to check for duplicate IDs across all book categories
 * Run this before importing data to ensure data integrity
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const categories = ['series', 'singles', 'novellas', 'anthologies'];

function validateAllIds() {
  let hasErrors = false;
  const idsByTable = {
    series_books: new Map(),
    singles: new Map(),
    novellas: new Map(),
    anthologies: new Map()
  };

  console.log('🔍 Validating IDs across all categories...\n');

  // Validate series books
  const seriesDir = path.join(dataDir, 'series');
  if (fs.existsSync(seriesDir)) {
    const files = fs.readdirSync(seriesDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

    files.forEach(file => {
      const filePath = path.join(seriesDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!content.books || !Array.isArray(content.books)) {
          return;
        }

        content.books.forEach(book => {
          if (!book.id) {
            console.error(`❌ Book missing ID in series ${content.name}: ${book.title}`);
            hasErrors = true;
            return;
          }

          if (!idsByTable.series_books.has(book.id)) {
            idsByTable.series_books.set(book.id, []);
          }
          idsByTable.series_books.get(book.id).push({
            category: 'series',
            parent: content.name,
            title: book.title,
            file: file
          });
        });
      } catch (error) {
        console.error(`❌ Error reading series/${file}: ${error.message}`);
        hasErrors = true;
      }
    });
  }

  // Validate singles, novellas, anthologies
  ['singles', 'novellas', 'anthologies'].forEach(category => {
    const categoryDir = path.join(dataDir, category);
    if (!fs.existsSync(categoryDir)) return;

    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

    files.forEach(file => {
      const filePath = path.join(categoryDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!content.id) {
          console.error(`❌ Missing ID in ${category}/${file}: ${content.title || 'unknown'}`);
          hasErrors = true;
          return;
        }

        if (!idsByTable[category].has(content.id)) {
          idsByTable[category].set(content.id, []);
        }
        idsByTable[category].get(content.id).push({
          category: category,
          title: content.title,
          file: file
        });
      } catch (error) {
        console.error(`❌ Error reading ${category}/${file}: ${error.message}`);
        hasErrors = true;
      }
    });
  });

  // Check for duplicates within each table
  Object.entries(idsByTable).forEach(([table, ids]) => {
    const duplicates = Array.from(ids.entries())
      .filter(([id, occurrences]) => occurrences.length > 1);

    if (duplicates.length > 0) {
      console.error(`❌ Duplicate IDs in ${table} table:\n`);
      duplicates.forEach(([id, occurrences]) => {
        console.error(`  ID: ${id}`);
        occurrences.forEach(occ => {
          const location = occ.parent ? `${occ.parent}` : occ.category;
          console.error(`    - ${occ.title} (${location}) in ${occ.file}`);
        });
        console.error('');
      });
      hasErrors = true;
    }
  });

  // Check for overlaps between tables (warning only, not an error)
  const tables = ['series_books', 'singles', 'novellas', 'anthologies'];
  let hasWarnings = false;

  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      const table1 = tables[i];
      const table2 = tables[j];

      const overlaps = [];
      idsByTable[table1].forEach((occurrences, id) => {
        if (idsByTable[table2].has(id)) {
          overlaps.push({
            id,
            table1: table1,
            table2: table2,
            data1: occurrences[0],
            data2: idsByTable[table2].get(id)[0]
          });
        }
      });

      if (overlaps.length > 0) {
        hasWarnings = true;
        console.warn(`\n⚠️  Warning: Overlapping IDs between ${table1} and ${table2}:`);
        overlaps.forEach(overlap => {
          console.warn(`  ${overlap.id}:`);
          console.warn(`    [${overlap.table1}] ${overlap.data1.title}`);
          console.warn(`    [${overlap.table2}] ${overlap.data2.title}`);
        });
        console.warn('  Note: This is not an error (different database tables) but may cause confusion.\n');
      }
    }
  }

  // Summary
  if (hasErrors) {
    console.error('❌ Validation failed! Please fix the errors above before importing.');
    process.exit(1);
  } else {
    console.log('✅ All IDs are valid and unique within their categories!');
    console.log(`   Series books: ${idsByTable.series_books.size}`);
    console.log(`   Singles: ${idsByTable.singles.size}`);
    console.log(`   Novellas: ${idsByTable.novellas.size}`);
    console.log(`   Anthologies: ${idsByTable.anthologies.size}`);
    console.log(`   Total unique IDs: ${idsByTable.series_books.size + idsByTable.singles.size + idsByTable.novellas.size + idsByTable.anthologies.size}`);

    if (hasWarnings) {
      console.log('\n⚠️  Warnings were found but do not prevent import.');
    }
  }
}

validateAllIds();
