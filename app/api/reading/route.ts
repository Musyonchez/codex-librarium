import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserReadingProgress, upsertReadingProgress } from '@/lib/supabase/queries';
import { ReadingEntry } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<ReadingEntry> = await request.json();

    if (!body.bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    // Upsert reading progress
    const result = await upsertReadingProgress(user.id, body.bookId, {
      status: body.status || 'unread',
      rating: body.rating,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating reading status:', error);
    return NextResponse.json(
      { error: 'Failed to update reading status' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const readingProgress = await getUserReadingProgress(user.id);

    // Transform to match the old ReadingTracker format for compatibility
    const readingData = readingProgress.map(rp => ({
      bookId: rp.book_id,
      status: rp.status,
      rating: rp.rating,
      notes: rp.notes,
      startedAt: rp.started_at,
      completedAt: rp.completed_at,
    }));

    return NextResponse.json({ readingData });
  } catch (error) {
    console.error('Error reading tracker:', error);
    return NextResponse.json(
      { error: 'Failed to read tracker' },
      { status: 500 }
    );
  }
}
