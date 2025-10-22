import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: singles, error } = await supabase
      .from('singles')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching singles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch singles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ singles });
  } catch (error) {
    console.error('Error in singles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
