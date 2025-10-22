import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch reading progress for novellas
    const { data: progress, error } = await supabase
      .from('reading_progress_novellas')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching novellas reading progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reading progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error in novellas reading progress API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
