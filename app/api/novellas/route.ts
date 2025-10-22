import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: novellas, error } = await supabase
      .from('novellas')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching novellas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch novellas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ novellas });
  } catch (error) {
    console.error('Error in novellas API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
