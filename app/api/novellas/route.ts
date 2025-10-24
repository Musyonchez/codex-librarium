import { NextResponse } from 'next/server';
import { getAllNovellas } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const novellas = await getAllNovellas();
    return NextResponse.json({ novellas });
  } catch (error) {
    console.error('Error in novellas API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch novellas' },
      { status: 500 }
    );
  }
}
