import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Folder {
  name: string;
  path: string;
  files: string[];
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const entries = await fs.readdir(dataDir, { withFileTypes: true });

    // Get all subdirectories
    const folders: Folder[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderPath = path.join(dataDir, entry.name);
        const files = await fs.readdir(folderPath);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        if (jsonFiles.length > 0) {
          folders.push({
            name: entry.name,
            path: entry.name,
            files: jsonFiles,
          });
        }
      }
    }

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
