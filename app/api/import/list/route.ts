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

    // Get all subdirectories (skip _meta folders)
    const folders: Folder[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '_meta') {
        const folderPath = path.join(dataDir, entry.name);
        const files = await fs.readdir(folderPath);
        // Skip _meta subfolder and only get JSON files
        const jsonFiles = files.filter(file =>
          file.endsWith('.json') && !file.startsWith('_meta')
        );

        if (jsonFiles.length > 0) {
          folders.push({
            name: entry.name.charAt(0).toUpperCase() + entry.name.slice(1), // Capitalize folder name
            path: entry.name,
            files: jsonFiles.sort(), // Sort files alphabetically
          });
        }
      }
    }

    // Sort folders: series, singles, novellas, anthologies
    const folderOrder = ['series', 'singles', 'novellas', 'anthologies'];
    folders.sort((a, b) => {
      const aIndex = folderOrder.indexOf(a.path);
      const bIndex = folderOrder.indexOf(b.path);
      return aIndex - bIndex;
    });

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
