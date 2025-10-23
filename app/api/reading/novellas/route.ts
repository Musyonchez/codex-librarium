import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, status, rating, notes } = body;

    if (!bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    // Upsert reading progress
    const { data, error } = await supabase
      .from('reading_progress_novellas')
      .upsert({
        user_id: user.id,
        novella_id: bookId,
        status: status || 'unread',
        rating: rating || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,novella_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating novellas reading progress:', error);
      return NextResponse.json(
        { error: 'Failed to update reading progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in novellas reading progress POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Transform novella_id to book_id for frontend consistency
    const transformedProgress = progress?.map(p => ({
      ...p,
      book_id: p.novella_id
    })) || [];

    return NextResponse.json({ progress: transformedProgress });
  } catch (error) {
    console.error('Error in novellas reading progress API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
