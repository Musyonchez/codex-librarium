import { NextRequest, NextResponse } from 'next/server';
import { updateBookRequestStatus, deleteBookRequest } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { BookRequestStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, refusalComment } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: BookRequestStatus[] = ['pending', 'waitlist', 'approved', 'refused'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // If moving to refused, require a comment
    if (status === 'refused' && !refusalComment) {
      return NextResponse.json(
        { error: 'Refusal comment is required when refusing a request' },
        { status: 400 }
      );
    }

    const updatedRequest = await updateBookRequestStatus(
      params.id,
      status,
      user.id,
      refusalComment
    );

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error('Error updating book request:', error);
    return NextResponse.json(
      { error: 'Failed to update book request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteBookRequest(params.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book request:', error);
    return NextResponse.json(
      { error: 'Failed to delete book request' },
      { status: 500 }
    );
  }
}
