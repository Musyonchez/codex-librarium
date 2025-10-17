import { createClient } from '@/lib/supabase/server';
import { Series, ReadingProgress } from '@/lib/types';

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
      books (*)
    `)
    .order('created_at');

  if (error) throw error;

  // Transform to match frontend types and sort books by order_in_series
  return data.map((series) => ({
    id: series.id,
    name: series.name,
    description: series.description,
    books: series.books
      .sort((a: { order_in_series: number }, b: { order_in_series: number }) =>
        a.order_in_series - b.order_in_series
      )
      .map((book: {
        id: string;
        title: string;
        author: string;
        order_in_series: number;
        legion: string[];
        tags: string[];
      }) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        orderInSeries: book.order_in_series,
        legion: book.legion,
        tags: book.tags,
      })),
  }));
}

export async function getUserReadingProgress(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reading_progress')
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
    .from('reading_progress')
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
    .from('reading_progress')
    .upsert(dataToUpsert, {
      onConflict: 'user_id,book_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ReadingProgress;
}
