import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const seriesDir = path.join(process.cwd(), 'data', 'series');
    const files = await fs.readdir(seriesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    return NextResponse.json({ files: jsonFiles });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
