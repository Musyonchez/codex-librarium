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
      singles: 0,
      novellas: 0,
      anthologies: 0,
      errors: [] as string[],
    };

    const dataDir = path.join(process.cwd(), 'data');

    // Load canonical lists from _meta folder (use series as reference)
    const metaDir = path.join(dataDir, 'series', '_meta');
    const tagsFilePath = path.join(metaDir, 'tags.json');
    const factionsFilePath = path.join(metaDir, 'factions.json');

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
        const data = JSON.parse(fileContent);

        // Normalize tags and factions helper
        const normalizeTags = (tags: string[]) =>
          (tags || []).map((tag: string) => {
            const canonical = findCanonical(tag, canonicalTags);
            newTags.add(canonical);
            return canonical;
          });

        const normalizeFactions = (factions: string[]) =>
          (factions || []).map((faction: string) => {
            const canonical = findCanonical(faction, canonicalFactions);
            newFactions.add(canonical);
            return canonical;
          });

        // Handle different folder types
        if (fileInfo.folder === 'series') {
          // Series with books
          const { error: seriesError } = await supabase
            .from('series')
            .upsert({
              id: data.id,
              name: data.name,
              description: data.description,
            }, {
              onConflict: 'id',
            });

          if (seriesError) {
            importResults.errors.push(`Series ${data.id}: ${seriesError.message}`);
            continue;
          }

          importResults.series++;

          // Upsert books
          for (const book of data.books) {
            const normalizedTags = normalizeTags(book.tags);
            const normalizedFactions = normalizeFactions(book.faction);

            const { error: bookError } = await supabase
              .from('books')
              .upsert({
                id: book.id,
                series_id: data.id,
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
        } else if (fileInfo.folder === 'singles') {
          // Single novels
          const normalizedTags = normalizeTags(data.tags);
          const normalizedFactions = normalizeFactions(data.faction);

          const { error } = await supabase
            .from('singles')
            .upsert({
              id: data.id,
              title: data.title,
              author: data.author,
              faction: normalizedFactions,
              tags: normalizedTags,
            }, {
              onConflict: 'id',
            });

          if (error) {
            importResults.errors.push(`Single ${data.id}: ${error.message}`);
          } else {
            importResults.singles++;
          }
        } else if (fileInfo.folder === 'novellas') {
          // Novellas
          const normalizedTags = normalizeTags(data.tags);
          const normalizedFactions = normalizeFactions(data.faction);

          const { error } = await supabase
            .from('novellas')
            .upsert({
              id: data.id,
              title: data.title,
              author: data.author,
              faction: normalizedFactions,
              tags: normalizedTags,
            }, {
              onConflict: 'id',
            });

          if (error) {
            importResults.errors.push(`Novella ${data.id}: ${error.message}`);
          } else {
            importResults.novellas++;
          }
        } else if (fileInfo.folder === 'anthologies') {
          // Anthologies
          const normalizedTags = normalizeTags(data.tags);
          const normalizedFactions = normalizeFactions(data.faction);

          const { error } = await supabase
            .from('anthologies')
            .upsert({
              id: data.id,
              title: data.title,
              author: data.author,
              faction: normalizedFactions,
              tags: normalizedTags,
            }, {
              onConflict: 'id',
            });

          if (error) {
            importResults.errors.push(`Anthology ${data.id}: ${error.message}`);
          } else {
            importResults.anthologies++;
          }
        }
      } catch (error) {
        importResults.errors.push(`File ${fileInfo.folder}/${fileInfo.file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update canonical lists if new tags/factions were found
    const updatedTags = Array.from(newTags).sort();
    const updatedFactions = Array.from(newFactions).sort();

    const hasTagsChanged = updatedTags.length !== canonicalTags.length ||
        !updatedTags.every((tag, i) => tag === canonicalTags[i]);
    const hasFactionsChanged = updatedFactions.length !== canonicalFactions.length ||
        !updatedFactions.every((faction, i) => faction === canonicalFactions[i]);

    if (hasTagsChanged || hasFactionsChanged) {
      // Update all _meta folders
      const metaFolders = ['series', 'singles', 'novellas', 'anthologies'];
      for (const folder of metaFolders) {
        const metaPath = path.join(dataDir, folder, '_meta');
        if (hasTagsChanged) {
          await fs.writeFile(
            path.join(metaPath, 'tags.json'),
            JSON.stringify(updatedTags, null, 2) + '\n'
          );
        }
        if (hasFactionsChanged) {
          await fs.writeFile(
            path.join(metaPath, 'factions.json'),
            JSON.stringify(updatedFactions, null, 2) + '\n'
          );
        }
      }
    }

    // Build summary message
    const parts = [];
    if (importResults.series > 0) parts.push(`${importResults.series} series`);
    if (importResults.books > 0) parts.push(`${importResults.books} books`);
    if (importResults.singles > 0) parts.push(`${importResults.singles} singles`);
    if (importResults.novellas > 0) parts.push(`${importResults.novellas} novellas`);
    if (importResults.anthologies > 0) parts.push(`${importResults.anthologies} anthologies`);

    const message = parts.length > 0
      ? `Import completed: ${parts.join(', ')}`
      : 'No items imported';

    return NextResponse.json({
      success: true,
      message,
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
