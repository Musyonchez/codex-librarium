'use client';

import { useState, useEffect } from 'react';
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

interface AvailableFile {
  name: string;
  selected: boolean;
}

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [availableFiles, setAvailableFiles] = useState<AvailableFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    fetchAvailableFiles();
  }, []);

  const fetchAvailableFiles = async () => {
    try {
      const response = await fetch('/api/import/list');
      const data = await response.json();
      if (data.files) {
        setAvailableFiles(data.files.map((name: string) => ({ name, selected: true })));
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load available files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const toggleFile = (fileName: string) => {
    setAvailableFiles(prev =>
      prev.map(file =>
        file.name === fileName ? { ...file, selected: !file.selected } : file
      )
    );
  };

  const toggleAll = () => {
    const allSelected = availableFiles.every(f => f.selected);
    setAvailableFiles(prev =>
      prev.map(file => ({ ...file, selected: !allSelected }))
    );
  };

  const handleImport = async () => {
    const selectedFiles = availableFiles.filter(f => f.selected).map(f => f.name);

    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to import');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: selectedFiles }),
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

  const selectedCount = availableFiles.filter(f => f.selected).length;

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold ${styles.textGold} mb-2`}>
            Import Books Data
          </h1>
          <p className={`${styles.textSecondary} mb-8`}>
            Select and import series from JSON files in the <code className="bg-slate-800 px-2 py-1 rounded">data/series</code> directory.
          </p>

          <div className={`${styles.card} p-8`}>
            <div className="space-y-6">
              <div>
                <h2 className={`text-2xl font-bold ${styles.textGold} mb-4`}>
                  Select Files to Import
                </h2>

                {loadingFiles ? (
                  <p className={styles.textSecondary}>Loading available files...</p>
                ) : availableFiles.length === 0 ? (
                  <p className={styles.textSecondary}>No JSON files found in data/series/</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={toggleAll}
                        className={`text-sm ${styles.textGold} hover:underline`}
                      >
                        {availableFiles.every(f => f.selected) ? 'Deselect All' : 'Select All'}
                      </button>
                      <span className={styles.textSecondary}>
                        {selectedCount} of {availableFiles.length} selected
                      </span>
                    </div>

                    <div className="space-y-2">
                      {availableFiles.map(file => (
                        <label
                          key={file.name}
                          className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                            file.selected ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-750'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={file.selected}
                            onChange={() => toggleFile(file.name)}
                            className="w-4 h-4 rounded border-slate-600 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-slate-900"
                          />
                          <span className={file.selected ? styles.textGold : styles.textSecondary}>
                            {file.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700 pt-6">
                <button
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  className={`${styles.btnPrimary} ${importing || selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {importing ? 'Importing...' : `Import ${selectedCount} ${selectedCount === 1 ? 'File' : 'Files'}`}
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
              How it works
            </h2>
            <ul className={`${styles.textSecondary} space-y-2`}>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Select which series files you want to import</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Imports only the selected series and their books</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Updates existing entries if they already exist (based on ID)</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Faster imports when you only need to update specific series</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
