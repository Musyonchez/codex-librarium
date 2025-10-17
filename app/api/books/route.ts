import { NextResponse } from 'next/server';
import { getSeriesWithBooks } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const series = await getSeriesWithBooks();
    return NextResponse.json({ series });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
