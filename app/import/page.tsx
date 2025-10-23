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
    singles: number;
    novellas: number;
    anthologies: number;
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
  const [importProgress, setImportProgress] = useState<string[]>([]);

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
    setImportProgress([]);

    // Simulate progress updates for better UX
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev.length < selectedFiles.length) {
          const nextFile = selectedFiles[prev.length];
          return [...prev, `Processing ${nextFile.folder}/${nextFile.file}...`];
        }
        return prev;
      });
    }, 300);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: selectedFiles }),
      });

      clearInterval(progressInterval);
      setImportProgress([]);

      const data: ImportResult = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(data.message || 'Import completed successfully!');
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setImportProgress([]);

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

              {/* Import Progress */}
              {importing && importProgress.length > 0 && (
                <div className="border-t border-slate-700 pt-6">
                  <div className={`${styles.card} p-6 bg-slate-800/50`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="animate-spin h-5 w-5 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
                      <h3 className={`text-lg font-bold ${styles.textGold}`}>
                        Importing Files...
                      </h3>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {importProgress.map((message, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-sm ${styles.textSecondary} animate-fade-in`}
                        >
                          <span className={styles.textGold}>→</span>
                          <span>{message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {result && (
                <div className="border-t border-slate-700 pt-6">
                  <div className={`${styles.card} p-6 ${result.success ? 'bg-emerald-950/30 border-2 border-emerald-800/50' : 'bg-red-950/30 border-2 border-red-800/50'}`}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`text-2xl ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.success ? '✓' : '✗'}
                      </div>
                      <h3 className={`text-2xl font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.success ? 'Import Successful' : 'Import Failed'}
                      </h3>
                    </div>

                    {/* Summary Message */}
                    {result.message && (
                      <p className={`mb-4 ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                        {result.message}
                      </p>
                    )}

                    {/* Success Stats */}
                    {result.results && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        {result.results.series > 0 && (
                          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${styles.textGold} mb-1`}>
                              {result.results.series}
                            </div>
                            <div className={`text-xs ${styles.textSecondary} uppercase tracking-wider`}>
                              Series
                            </div>
                          </div>
                        )}
                        {result.results.books > 0 && (
                          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${styles.textGold} mb-1`}>
                              {result.results.books}
                            </div>
                            <div className={`text-xs ${styles.textSecondary} uppercase tracking-wider`}>
                              Books
                            </div>
                          </div>
                        )}
                        {result.results.singles > 0 && (
                          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${styles.textGold} mb-1`}>
                              {result.results.singles}
                            </div>
                            <div className={`text-xs ${styles.textSecondary} uppercase tracking-wider`}>
                              Singles
                            </div>
                          </div>
                        )}
                        {result.results.novellas > 0 && (
                          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${styles.textGold} mb-1`}>
                              {result.results.novellas}
                            </div>
                            <div className={`text-xs ${styles.textSecondary} uppercase tracking-wider`}>
                              Novellas
                            </div>
                          </div>
                        )}
                        {result.results.anthologies > 0 && (
                          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${styles.textGold} mb-1`}>
                              {result.results.anthologies}
                            </div>
                            <div className={`text-xs ${styles.textSecondary} uppercase tracking-wider`}>
                              Anthologies
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Errors Section */}
                    {result.results?.errors && result.results.errors.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-red-400 text-xl">⚠</span>
                          <p className="font-semibold text-red-400">
                            {result.results.errors.length} {result.results.errors.length === 1 ? 'Error' : 'Errors'} Encountered
                          </p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 max-h-80 overflow-y-auto border border-red-900/30">
                          <div className="space-y-2">
                            {result.results.errors.map((error, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 text-sm p-3 bg-red-950/20 rounded border-l-2 border-red-500"
                              >
                                <span className="text-red-400 font-mono text-xs mt-0.5">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="text-red-200 flex-1">{error}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* General Error */}
                    {result.error && (
                      <div className="mt-4 bg-red-950/30 border border-red-800/50 rounded-lg p-4">
                        <p className="font-semibold text-red-400 mb-2">
                          Error: {result.error}
                        </p>
                        {result.details && (
                          <p className="text-sm text-red-300 font-mono bg-slate-900/50 p-3 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
