import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ReadingTracker, ReadingEntry } from '@/lib/types';

const TRACKER_PATH = path.join(process.cwd(), 'data', 'reading-tracker.json');

async function getTracker(): Promise<ReadingTracker> {
  const data = await fs.readFile(TRACKER_PATH, 'utf-8');
  return JSON.parse(data);
}

async function saveTracker(tracker: ReadingTracker): Promise<void> {
  await fs.writeFile(TRACKER_PATH, JSON.stringify(tracker, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body: Partial<ReadingEntry> = await request.json();

    if (!body.bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    const tracker = await getTracker();
    const existingIndex = tracker.readingData.findIndex(r => r.bookId === body.bookId);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing entry
      const existing = tracker.readingData[existingIndex];
      tracker.readingData[existingIndex] = {
        ...existing,
        ...body,
        bookId: body.bookId,
        // Set startedAt if status changes to 'reading' and not already set
        startedAt: body.status === 'reading' && !existing.startedAt ? now : existing.startedAt,
        // Set completedAt if status changes to 'completed'
        completedAt: body.status === 'completed' ? now : existing.completedAt,
      };
    } else {
      // Create new entry
      const newEntry: ReadingEntry = {
        bookId: body.bookId,
        status: body.status || 'unread',
        rating: body.rating,
        notes: body.notes,
        startedAt: body.status === 'reading' ? now : undefined,
        completedAt: body.status === 'completed' ? now : undefined,
      };
      tracker.readingData.push(newEntry);
    }

    await saveTracker(tracker);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reading status:', error);
    return NextResponse.json({ error: 'Failed to update reading status' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tracker = await getTracker();
    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Error reading tracker:', error);
    return NextResponse.json({ error: 'Failed to read tracker' }, { status: 500 });
  }
}
