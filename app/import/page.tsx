'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { styles } from '@/lib/design-system';
import { toast } from 'sonner';

interface ImportResult {
  success: boolean;
  message?: string;
  results?: {
    series: number;
    books: number;
    errors: string[];
  };
  error?: string;
  details?: string;
}

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
      });

      const data: ImportResult = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(data.message || 'Import completed successfully!');
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        error: 'Failed to import data',
        details: errorMsg,
      });
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold ${styles.textGold} mb-2`}>
            Import Books Data
          </h1>
          <p className={`${styles.textSecondary} mb-8`}>
            Import series and books from JSON files in the <code className="bg-slate-800 px-2 py-1 rounded">data/series</code> directory to the database.
          </p>

          <div className={`${styles.card} p-8`}>
            <div className="space-y-6">
              <div>
                <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>
                  How it works
                </h2>
                <ul className={`${styles.textSecondary} space-y-2`}>
                  <li className="flex gap-2">
                    <span className={styles.textGold}>•</span>
                    <span>Reads all JSON files from <code className="bg-slate-800 px-2 py-1 rounded text-sm">data/series/</code></span>
                  </li>
                  <li className="flex gap-2">
                    <span className={styles.textGold}>•</span>
                    <span>Imports each series and its books into the database</span>
                  </li>
                  <li className="flex gap-2">
                    <span className={styles.textGold}>•</span>
                    <span>Updates existing entries if they already exist (based on ID)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className={styles.textGold}>•</span>
                    <span>Shows detailed results of the import operation</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className={`${styles.btnPrimary} ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {importing ? 'Importing...' : 'Import from JSON Files'}
                </button>
              </div>

              {result && (
                <div className={`border-t border-slate-700 pt-6 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  <h3 className="text-xl font-bold mb-3">
                    {result.success ? 'Import Successful' : 'Import Failed'}
                  </h3>

                  {result.message && (
                    <p className="mb-4">{result.message}</p>
                  )}

                  {result.results && (
                    <div className="space-y-2 mb-4">
                      <p className={styles.textSecondary}>
                        <span className="font-semibold">Series imported:</span> {result.results.series}
                      </p>
                      <p className={styles.textSecondary}>
                        <span className="font-semibold">Books imported:</span> {result.results.books}
                      </p>
                    </div>
                  )}

                  {result.results?.errors && result.results.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold text-red-400 mb-2">Errors:</p>
                      <div className="bg-slate-800 rounded p-4 max-h-60 overflow-y-auto">
                        <ul className="space-y-1 text-sm">
                          {result.results.errors.map((error, index) => (
                            <li key={index} className="text-red-300">• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {result.error && (
                    <div className="mt-4">
                      <p className="font-semibold text-red-400">Error: {result.error}</p>
                      {result.details && (
                        <p className="text-sm text-red-300 mt-2">{result.details}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.card} p-6 mt-6`}>
            <h2 className={`text-xl font-bold ${styles.textGold} mb-3`}>
              JSON File Format
            </h2>
            <p className={`${styles.textSecondary} mb-4`}>
              Each series JSON file should have the following structure:
            </p>
            <pre className="bg-slate-950 p-4 rounded overflow-x-auto text-sm">
              <code className={styles.textSecondary}>{`{
  "id": "series-id",
  "name": "Series Name",
  "description": "Series description",
  "books": [
    {
      "id": "book-id",
      "title": "Book Title",
      "author": "Author Name",
      "orderInSeries": 1,
      "faction": ["Faction 1", "Faction 2"],
      "tags": ["Tag 1", "Tag 2"]
    }
  ]
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
