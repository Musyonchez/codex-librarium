import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all books with their tags and factions
    const { data: books, error } = await supabase
      .from('books')
      .select('faction, tags');

    if (error) {
      console.error('Error fetching filters:', error);
      return NextResponse.json(
        { error: 'Failed to fetch filters' },
        { status: 500 }
      );
    }

    // Extract unique tags and factions
    const tagsSet = new Set<string>();
    const factionsSet = new Set<string>();

    books?.forEach(book => {
      book.tags?.forEach((tag: string) => tagsSet.add(tag));
      book.faction?.forEach((faction: string) => factionsSet.add(faction));
    });

    // Convert to sorted arrays
    const tags = Array.from(tagsSet).sort();
    const factions = Array.from(factionsSet).sort();

    return NextResponse.json({ tags, factions });
  } catch (error) {
    console.error('Error in filters endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
