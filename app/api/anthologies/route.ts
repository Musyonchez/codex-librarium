import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: anthologies, error } = await supabase
      .from('anthologies')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching anthologies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch anthologies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ anthologies });
  } catch (error) {
    console.error('Error in anthologies API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
