import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/admin';

// Helper function to normalize strings (trim, consistent casing)
function normalizeString(str: string): string {
  return str.trim();
}

// Helper function to find canonical version of a tag/faction (case-insensitive match)
function findCanonical(value: string, canonicalList: string[]): string {
  const normalized = normalizeString(value);
  const match = canonicalList.find(
    item => item.toLowerCase() === normalized.toLowerCase()
  );
  return match || normalized;
}

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Use service role client to bypass RLS for imports
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get selected files from request body
    // Format: { files: [{ folder: 'series', file: 'horus-heresy.json' }, ...] }
    const body = await request.json().catch(() => ({}));
    const selectedFiles: Array<{ folder: string; file: string }> = body.files || [];

    // If no files selected, return error
    if (selectedFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files selected for import',
      });
    }

    const importResults = {
      series: 0,
      books: 0,
      errors: [] as string[],
    };

    const dataDir = path.join(process.cwd(), 'data');

    // Load canonical lists
    const tagsFilePath = path.join(dataDir, 'tags.json');
    const factionsFilePath = path.join(dataDir, 'factions.json');

    let canonicalTags: string[] = [];
    let canonicalFactions: string[] = [];

    try {
      canonicalTags = JSON.parse(await fs.readFile(tagsFilePath, 'utf-8'));
    } catch (error) {
      console.warn('tags.json not found, will create it');
    }

    try {
      canonicalFactions = JSON.parse(await fs.readFile(factionsFilePath, 'utf-8'));
    } catch (error) {
      console.warn('factions.json not found, will create it');
    }

    // Track new tags/factions found during import
    const newTags = new Set<string>(canonicalTags);
    const newFactions = new Set<string>(canonicalFactions);

    for (const fileInfo of selectedFiles) {
      try {
        const filePath = path.join(dataDir, fileInfo.folder, fileInfo.file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const seriesData = JSON.parse(fileContent);

        // Upsert series
        const { error: seriesError } = await supabase
          .from('series')
          .upsert({
            id: seriesData.id,
            name: seriesData.name,
            description: seriesData.description,
          }, {
            onConflict: 'id',
          });

        if (seriesError) {
          importResults.errors.push(`Series ${seriesData.id}: ${seriesError.message}`);
          continue;
        }

        importResults.series++;

        // Upsert books
        for (const book of seriesData.books) {
          // Normalize tags
          const normalizedTags = (book.tags || []).map((tag: string) => {
            const canonical = findCanonical(tag, canonicalTags);
            newTags.add(canonical);
            return canonical;
          });

          // Normalize factions
          const normalizedFactions = (book.faction || []).map((faction: string) => {
            const canonical = findCanonical(faction, canonicalFactions);
            newFactions.add(canonical);
            return canonical;
          });

          const { error: bookError } = await supabase
            .from('books')
            .upsert({
              id: book.id,
              series_id: seriesData.id,
              title: book.title,
              author: book.author,
              order_in_series: book.orderInSeries,
              faction: normalizedFactions,
              tags: normalizedTags,
            }, {
              onConflict: 'id',
            });

          if (bookError) {
            importResults.errors.push(`Book ${book.id}: ${bookError.message}`);
          } else {
            importResults.books++;
          }
        }
      } catch (error) {
        importResults.errors.push(`File ${fileInfo.folder}/${fileInfo.file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update canonical lists if new tags/factions were found
    const updatedTags = Array.from(newTags).sort();
    const updatedFactions = Array.from(newFactions).sort();

    if (updatedTags.length !== canonicalTags.length ||
        !updatedTags.every((tag, i) => tag === canonicalTags[i])) {
      await fs.writeFile(tagsFilePath, JSON.stringify(updatedTags, null, 2) + '\n');
    }

    if (updatedFactions.length !== canonicalFactions.length ||
        !updatedFactions.every((faction, i) => faction === canonicalFactions[i])) {
      await fs.writeFile(factionsFilePath, JSON.stringify(updatedFactions, null, 2) + '\n');
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${importResults.series} series, ${importResults.books} books`,
      results: importResults,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
