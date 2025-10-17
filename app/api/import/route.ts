import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Get selected files from request body, or import all if none specified
    const body = await request.json().catch(() => ({}));
    const selectedFiles = body.files || [];

    // Read series JSON files from data/series directory
    const seriesDir = path.join(process.cwd(), 'data', 'series');
    const files = await fs.readdir(seriesDir);
    const allJsonFiles = files.filter(file => file.endsWith('.json'));

    // If specific files are selected, only process those
    const jsonFiles = selectedFiles.length > 0
      ? allJsonFiles.filter(file => selectedFiles.includes(file))
      : allJsonFiles;

    const importResults = {
      series: 0,
      books: 0,
      errors: [] as string[],
    };

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(seriesDir, file);
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
          const { error: bookError } = await supabase
            .from('books')
            .upsert({
              id: book.id,
              series_id: seriesData.id,
              title: book.title,
              author: book.author,
              order_in_series: book.orderInSeries,
              faction: book.faction || [],
              tags: book.tags || [],
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
        importResults.errors.push(`File ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
