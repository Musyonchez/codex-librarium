'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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

interface FileSelection {
  folder: string;
  file: string;
  selected: boolean;
}

interface Folder {
  name: string;
  path: string;
  files: string[];
}

export default function ImportPage() {
  const router = useRouter();
  const supabase = createClient();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [fileSelections, setFileSelections] = useState<FileSelection[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/dashboard');
        return;
      }

      // Check if user is admin
      const response = await fetch('/api/import/check-admin');
      const data = await response.json();

      if (!data.isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      fetchAvailableFolders();
    } catch (error) {
      console.error('Failed to check admin access:', error);
      router.push('/dashboard');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchAvailableFolders = async () => {
    try {
      const response = await fetch('/api/import/list');
      const data = await response.json();
      if (data.folders) {
        setFolders(data.folders);

        // Create file selections (all deselected by default)
        const selections: FileSelection[] = [];
        data.folders.forEach((folder: Folder) => {
          folder.files.forEach(file => {
            selections.push({
              folder: folder.path,
              file: file,
              selected: false,
            });
          });
        });
        setFileSelections(selections);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      toast.error('Failed to load available files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const toggleFile = (folder: string, fileName: string) => {
    setFileSelections(prev =>
      prev.map(sel =>
        sel.folder === folder && sel.file === fileName
          ? { ...sel, selected: !sel.selected }
          : sel
      )
    );
  };

  const toggleAllInFolder = (folder: string) => {
    const folderFiles = fileSelections.filter(sel => sel.folder === folder);
    const allSelected = folderFiles.every(sel => sel.selected);

    setFileSelections(prev =>
      prev.map(sel =>
        sel.folder === folder
          ? { ...sel, selected: !allSelected }
          : sel
      )
    );
  };

  const handleImport = async () => {
    const selectedFiles = fileSelections
      .filter(sel => sel.selected)
      .map(sel => ({ folder: sel.folder, file: sel.file }));

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

  const selectedCount = fileSelections.filter(sel => sel.selected).length;
  const totalCount = fileSelections.length;

  const getFolderFileCount = (folderPath: string) => {
    return fileSelections.filter(sel => sel.folder === folderPath).length;
  };

  const getFolderSelectedCount = (folderPath: string) => {
    return fileSelections.filter(sel => sel.folder === folderPath && sel.selected).length;
  };

  if (checkingAdmin) {
    return (
      <AppLayout requireAuth={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className={`${styles.textGold} text-xl`}>Checking access...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold ${styles.textGold} mb-2`}>
            Import Books Data
          </h1>
          <p className={`${styles.textSecondary} mb-8`}>
            Select JSON files from the <code className="bg-slate-800 px-2 py-1 rounded">data/</code> directory to import.
          </p>

          <div className={`${styles.card} p-8`}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-2xl font-bold ${styles.textGold}`}>
                    Select Files to Import
                  </h2>
                  <span className={styles.textSecondary}>
                    {selectedCount} of {totalCount} selected
                  </span>
                </div>

                {loadingFiles ? (
                  <p className={styles.textSecondary}>Loading available files...</p>
                ) : folders.length === 0 ? (
                  <p className={styles.textSecondary}>No folders found in data/</p>
                ) : (
                  <div className="space-y-2">
                    {folders.map(folder => {
                      const isExpanded = expandedFolders.has(folder.path);
                      const folderSelectedCount = getFolderSelectedCount(folder.path);
                      const folderFileCount = getFolderFileCount(folder.path);

                      return (
                        <div key={folder.path} className="bg-slate-800 rounded-lg overflow-hidden">
                          {/* Folder Header */}
                          <div className="flex items-center justify-between p-4">
                            <button
                              onClick={() => toggleFolder(folder.path)}
                              className="flex items-center gap-3 flex-1 text-left"
                            >
                              <span className={`${styles.textGold} text-xl font-bold`}>
                                {isExpanded ? '−' : '+'}
                              </span>
                              <div>
                                <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>
                                  {folder.name}
                                </h3>
                                <p className={`text-sm ${styles.textSecondary}`}>
                                  {folderSelectedCount} of {folderFileCount} files selected
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => toggleAllInFolder(folder.path)}
                              className={`text-sm ${styles.textGold} hover:underline px-4`}
                            >
                              {folderSelectedCount === folderFileCount ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          {/* Folder Files */}
                          {isExpanded && (
                            <div className="border-t border-slate-700 p-4 space-y-2">
                              {fileSelections
                                .filter(sel => sel.folder === folder.path)
                                .map(sel => (
                                  <label
                                    key={`${sel.folder}-${sel.file}`}
                                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                                      sel.selected ? 'bg-slate-700' : 'bg-slate-750 hover:bg-slate-700'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={sel.selected}
                                      onChange={() => toggleFile(sel.folder, sel.file)}
                                      className="w-4 h-4 rounded border-slate-600 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-slate-900"
                                    />
                                    <span className={sel.selected ? styles.textGold : styles.textSecondary}>
                                      {sel.file}
                                    </span>
                                  </label>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                <span>Browse folders in the <code className="bg-slate-800 px-2 py-1 rounded text-sm">data/</code> directory</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Click on a folder to expand and see available JSON files</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Select individual files or use &ldquo;Select All&rdquo; per folder</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Import only what you need - perfect for updating specific series</span>
              </li>
              <li className="flex gap-2">
                <span className={styles.textGold}>•</span>
                <span>Future-proof: easily add new folders for different categories</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
