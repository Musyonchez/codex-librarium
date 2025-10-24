import { NextResponse } from 'next/server';
import { getAllSingles } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const singles = await getAllSingles();
    return NextResponse.json({ singles });
  } catch (error) {
    console.error('Error in singles API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch singles' },
      { status: 500 }
    );
  }
}
