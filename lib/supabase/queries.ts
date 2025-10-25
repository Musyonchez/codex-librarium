import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Series, ReadingProgress, Single, Novella, Anthology, BookRequest, BookRequestStatus } from '@/lib/types';

export async function getAllSeries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('created_at');

  if (error) throw error;
  return data as Series[];
}

export async function getSeriesWithBooks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('series')
    .select(`
      *,
      series_books (*)
    `)
    .order('created_at');

  if (error) throw error;

  // Transform to match frontend types and sort books by order_in_series
  return data.map((series) => ({
    id: series.id,
    name: series.name,
    description: series.description,
    books: (series.series_books || [])
      .sort((a: { order_in_series: number }, b: { order_in_series: number }) =>
        a.order_in_series - b.order_in_series
      )
      .map((book: {
        id: string;
        title: string;
        author: string;
        order_in_series: number;
        faction: string[];
        tags: string[];
      }) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        orderInSeries: book.order_in_series,
        faction: book.faction,
        tags: book.tags,
      })),
  }));
}

export async function getUserReadingProgress(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reading_progress_series_books')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as ReadingProgress[];
}

export async function upsertReadingProgress(
  userId: string,
  bookId: string,
  updates: Partial<ReadingProgress>
) {
  const supabase = await createClient();

  // Check if there's an existing entry
  const { data: existing } = await supabase
    .from('reading_progress_series_books')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .single();

  const now = new Date().toISOString();
  const dataToUpsert: Record<string, unknown> = {
    user_id: userId,
    book_id: bookId,
    ...updates,
  };

  // Set timestamps based on status changes
  if (updates.status === 'reading' && !existing?.started_at) {
    dataToUpsert.started_at = now;
  } else if (existing?.started_at) {
    dataToUpsert.started_at = existing.started_at;
  }

  if (updates.status === 'completed') {
    dataToUpsert.completed_at = now;
  } else if (existing?.completed_at) {
    dataToUpsert.completed_at = existing.completed_at;
  }

  const { data, error } = await supabase
    .from('reading_progress_series_books')
    .upsert(dataToUpsert, {
      onConflict: 'user_id,book_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ReadingProgress;
}

// Singles query functions
export async function getAllSingles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .order('title', { ascending: true });

  if (error) throw error;
  return data as Single[];
}

// Novellas query functions
export async function getAllNovellas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('novellas')
    .select('*')
    .order('title', { ascending: true });

  if (error) throw error;
  return data as Novella[];
}

// Anthologies query functions
export async function getAllAnthologies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('anthologies')
    .select('*')
    .order('title', { ascending: true });

  if (error) throw error;
  return data as Anthology[];
}

// Book Requests query functions
export async function getAllBookRequests(status?: BookRequestStatus) {
  const supabase = await createClient();

  let query = supabase
    .from('book_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as BookRequest[];
}

export async function createBookRequest(
  userId: string,
  title: string,
  author: string,
  bookType: string,
  additionalInfo?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('book_requests')
    .insert({
      title,
      author,
      book_type: bookType,
      additional_info: additionalInfo,
      requested_by: userId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data as BookRequest;
}

export async function updateBookRequestStatus(
  requestId: string,
  newStatus: BookRequestStatus,
  userId: string,
  refusalComment?: string
) {
  // Use admin client to bypass RLS (only admins can call this function)
  const supabase = createAdminClient();

  // Get current request to check previous status
  const { data: current } = await supabase
    .from('book_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: now
  };

  // Handle refusal comment logic
  if (newStatus === 'refused') {
    // Moving TO refused - set/update comment
    if (refusalComment) {
      updateData.refusal_comment = refusalComment;

      // If comment didn't exist before, this is a new comment
      if (!current?.refusal_comment) {
        updateData.refusal_comment_created_by = userId;
        updateData.refusal_comment_created_at = now;
      } else {
        // Comment existed, this is an edit
        updateData.refusal_comment_updated_by = userId;
        updateData.refusal_comment_updated_at = now;
      }
    }
  } else if (current?.status === 'refused') {
    // Moving FROM refused to another status - clear comment
    updateData.refusal_comment = null;
    updateData.refusal_comment_created_by = null;
    updateData.refusal_comment_updated_by = null;
    updateData.refusal_comment_created_at = null;
    updateData.refusal_comment_updated_at = null;
  }

  const { data, error } = await supabase
    .from('book_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data as BookRequest;
}

export async function deleteBookRequest(requestId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('book_requests')
    .delete()
    .eq('id', requestId)
    .eq('requested_by', userId)
    .eq('status', 'pending');

  if (error) throw error;
}
