import { NextRequest, NextResponse } from 'next/server';
import { getAllBookRequests, createBookRequest } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { BookRequestStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as BookRequestStatus | null;

    const requests = await getAllBookRequests(status || undefined);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error in requests API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, author, bookType, additionalInfo } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const newRequest = await createBookRequest(
      user.id,
      title,
      author,
      bookType || 'other',
      additionalInfo
    );

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating book request:', error);
    return NextResponse.json(
      { error: 'Failed to create book request' },
      { status: 500 }
    );
  }
}
