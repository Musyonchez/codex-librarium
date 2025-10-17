import { createClient } from '@supabase/supabase-js';
import booksMetadata from '../data/books-metadata.json';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('🚀 Starting migration to Supabase...\n');

  try {
    // Step 1: Insert series
    console.log('📚 Inserting series...');
    const seriesData = booksMetadata.series.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));

    const { error: seriesError } = await supabase
      .from('series')
      .upsert(seriesData, { onConflict: 'id' });

    if (seriesError) {
      console.error('❌ Error inserting series:', seriesError);
      throw seriesError;
    }
    console.log(`✅ Inserted ${seriesData.length} series\n`);

    // Step 2: Insert books
    console.log('📖 Inserting books...');
    let totalBooks = 0;

    for (const series of booksMetadata.series) {
      const booksData = series.books.map(b => ({
        id: b.id,
        series_id: series.id,
        title: b.title,
        author: b.author,
        order_in_series: b.orderInSeries,
        legion: b.legion || [],
        tags: b.tags || [],
      }));

      const { error: booksError } = await supabase
        .from('books')
        .upsert(booksData, { onConflict: 'id' });

      if (booksError) {
        console.error(`❌ Error inserting books for ${series.name}:`, booksError);
        throw booksError;
      }

      totalBooks += booksData.length;
      console.log(`  ✓ ${series.name}: ${booksData.length} books`);
    }

    console.log(`\n✅ Inserted ${totalBooks} books total\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase dashboard');
    console.log('2. Test authentication flow');
    console.log('3. Start the dev server with: npm run dev');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
