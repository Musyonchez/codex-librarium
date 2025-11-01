#!/usr/bin/env node

/**
 * Script to check for missing book numbers in series
 * This helps identify gaps in series numbering
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const seriesDir = path.join(dataDir, 'series');

function checkMissingNumbers() {
  console.log('🔍 Checking for missing book numbers in series...\n');

  if (!fs.existsSync(seriesDir)) {
    console.error('❌ Series directory not found');
    process.exit(1);
  }

  const files = fs.readdirSync(seriesDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  let totalGaps = 0;

  files.forEach(file => {
    const filePath = path.join(seriesDir, file);

    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (!content.books || !Array.isArray(content.books)) {
        return;
      }

      // Extract all orderInSeries numbers
      const orders = content.books
        .map(book => book.orderInSeries)
        .filter(order => order !== undefined && order !== null)
        .sort((a, b) => a - b);

      if (orders.length === 0) {
        return;
      }

      // Find missing numbers
      const min = Math.min(...orders);
      const max = Math.max(...orders);
      const missing = [];

      for (let i = min; i <= max; i++) {
        if (!orders.includes(i)) {
          missing.push(i);
        }
      }

      // Report results
      if (missing.length > 0) {
        console.log(`📚 ${content.name || file}`);
        console.log(`   File: ${file}`);
        console.log(`   Books: ${orders.length} (numbered ${min}-${max})`);
        console.log(`   ❌ Missing numbers: ${missing.join(', ')}`);
        console.log('');
        totalGaps += missing.length;
      } else {
        console.log(`✅ ${content.name || file} - Complete (${orders.length} books, ${min}-${max})`);
      }

    } catch (error) {
      console.error(`❌ Error reading ${file}: ${error.message}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  if (totalGaps > 0) {
    console.log(`\n⚠️  Found ${totalGaps} missing book number(s) across all series.`);
    process.exit(1);
  } else {
    console.log('\n✅ All series have complete numbering!');
  }
}

checkMissingNumbers();
