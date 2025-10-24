import { NextResponse } from 'next/server';
import { getAllAnthologies } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const anthologies = await getAllAnthologies();
    return NextResponse.json({ anthologies });
  } catch (error) {
    console.error('Error in anthologies API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anthologies' },
      { status: 500 }
    );
  }
}
