import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Database,
  RefreshCw,
  FileText,
  AlertTriangle,
  Loader2,
  ListChecks,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  parseAndValidateMCQCSV,
  generateSampleCSV,
  CSVParseResult,
  MCQImportItem,
} from '../lib/csvImporter';
import { bulkImportMcqsToSupabase, fetchMcqBankStatsFromSupabase, User } from '../lib/supabase';

interface AdminBulkMcqImportTabProps {
  currentUser: User | null;
}

export const AdminBulkMcqImportTab: React.FC<AdminBulkMcqImportTabProps> = ({ currentUser }) => {
  const [csvText, setCsvText] = useState<string>('');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    insertedCount?: number;
    errors?: string[];
  }>({ type: 'idle', message: '' });

  const [dbStats, setDbStats] = useState<{ count: number; available: boolean } | null>(null);
  const [isFetchingStats, setIsFetchingStats] = useState<boolean>(false);
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>('upload');
  const [copiedSample, setCopiedSample] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminEmail = currentUser?.email || 'shsvirtualadmin@gmail.com';

  const loadDbStats = async () => {
    setIsFetchingStats(true);
    const stats = await fetchMcqBankStatsFromSupabase();
    setDbStats(stats);
    setIsFetchingStats(false);
  };

  useEffect(() => {
    loadDbStats();
  }, []);

  // Whenever csvText changes, re-parse and validate
  useEffect(() => {
    if (!csvText.trim()) {
      setParseResult(null);
      return;
    }
    const result = parseAndValidateMCQCSV(csvText);
    setParseResult(result);
  }, [csvText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setImportStatus({ type: 'idle', message: '' });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      setImportStatus({
        type: 'error',
        message: 'Please upload a valid .csv file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setImportStatus({ type: 'idle', message: '' });
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCSV();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mcq_bank_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySample = () => {
    const sample = generateSampleCSV();
    navigator.clipboard.writeText(sample);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validItems.length === 0) return;

    setIsImporting(true);
    setImportStatus({ type: 'idle', message: 'Importing MCQs into Supabase...' });

    const result = await bulkImportMcqsToSupabase(parseResult.validItems, adminEmail);

    setIsImporting(false);

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: result.message,
        insertedCount: result.insertedCount,
        errors: result.errors,
      });
      // Refresh DB stats
      loadDbStats();
    } else {
      setImportStatus({
        type: 'error',
        message: result.message,
        errors: result.errors,
      });
    }
  };

  const handleClear = () => {
    setCsvText('');
    setParseResult(null);
    setImportStatus({ type: 'idle', message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & DB Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-900/40 via-teal-950/40 to-slate-900/60 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Bulk MCQ CSV Importer
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                Supabase mcq_bank
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Upload or paste CSV files to bulk insert thousands of high-quality MDCAT/FBISE MCQs directly into the <code className="text-emerald-300 font-mono text-xs">mcq_bank</code> table. Includes automated schema & column validation.
            </p>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 min-w-[220px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Status
            </span>
            <button
              onClick={loadDbStats}
              disabled={isFetchingStats}
              className="text-slate-400 hover:text-white transition-colors"
              title="Refresh DB stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingStats ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {isFetchingStats ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              ) : (
                dbStats?.count ?? '—'
              )}
            </span>
            <span className="text-xs text-slate-400 font-medium">Total MCQs in DB</span>
          </div>
        </div>
      </div>

      {/* Template Download & Instructions Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Required CSV Columns
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              CSV files must contain headers for <code className="text-emerald-400 font-semibold">subject</code>, <code className="text-emerald-400 font-semibold">topic</code>, <code className="text-emerald-400 font-semibold">question</code>, and <code className="text-emerald-400 font-semibold">correct_option</code> (A, B, C, or D).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySample}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSample ? 'Copied CSV!' : 'Copy Sample'}
            </button>
            <button
              onClick={handleDownloadSample}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV Template
            </button>
          </div>
        </div>

        {/* Expected Headers Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
          <div className="p-2 bg-slate-950/80 border border-emerald-500/30 rounded-lg text-slate-300">
            <span className="text-emerald-400 font-bold block">subject *</span>
            <span className="text-[10px] text-slate-500">e.g. Biology</span>
          </div>
          <div className="p-2 bg-slate-950/80 border border-emerald-500/30 rounded-lg text-slate-300">
            <span className="text-emerald-400 font-bold block">topic *</span>
            <span className="text-[10px] text-slate-500">e.g. Cell Biology</span>
          </div>
          <div className="p-2 bg-slate-950/80 border border-emerald-500/30 rounded-lg text-slate-300">
            <span className="text-emerald-400 font-bold block">question *</span>
            <span className="text-[10px] text-slate-500">MCQ text</span>
          </div>
          <div className="p-2 bg-slate-950/80 border border-emerald-500/30 rounded-lg text-slate-300">
            <span className="text-emerald-400 font-bold block">correct_option *</span>
            <span className="text-[10px] text-slate-500">A, B, C, or D</span>
          </div>
          <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-400">
            <span className="text-slate-300 font-medium block">option_a, b, c, d</span>
            <span className="text-[10px] text-slate-500">Answer choices</span>
          </div>
          <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-400">
            <span className="text-slate-300 font-medium block">explanation</span>
            <span className="text-[10px] text-slate-500">Detailed answer</span>
          </div>
        </div>
      </div>

      {/* Input Mode Selector & File Drop Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveInputMode('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInputMode === 'upload'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" /> Upload CSV File
            </button>
            <button
              onClick={() => setActiveInputMode('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInputMode === 'paste'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Paste Raw CSV Text
            </button>
          </div>

          {csvText && (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Clear Input
            </button>
          )}
        </div>

        {activeInputMode === 'upload' ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag and drop your MCQ CSV file here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              or <span className="text-emerald-400 underline font-medium">browse local files</span> from your device (.csv format)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Paste CSV Content</span>
              <span className="text-slate-500 font-mono text-[11px]">comma-delimited</span>
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="subject,topic,subtopic,question,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,source..."
              rows={8}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        )}
      </div>

      {/* Header Validation Banner */}
      {parseResult && (
        <div className="space-y-4">
          {parseResult.missingRequiredHeaders.length > 0 ? (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-200">Missing Required CSV Header Columns</h4>
                <p className="mt-1">
                  The uploaded CSV is missing mandatory columns:{' '}
                  <span className="font-mono font-bold text-rose-300">
                    {parseResult.missingRequiredHeaders.join(', ')}
                  </span>
                </p>
                <p className="mt-1 text-slate-400">
                  Please update your CSV headers to match: <code className="text-slate-200">subject, topic, question, correct_option</code>.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    CSV Schema Verified Successfully
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Found {parseResult.validItems.length} valid MCQ rows out of {parseResult.totalRowsParsed} parsed rows.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={isImporting || parseResult.validItems.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Importing to Supabase...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" /> Insert {parseResult.validItems.length} MCQs into Supabase
                  </>
                )}
              </button>
            </div>
          )}

          {/* Import Status Alert */}
          {importStatus.type !== 'idle' && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{importStatus.message}</p>
                {importStatus.errors && importStatus.errors.length > 0 && (
                  <ul className="list-disc list-inside text-[11px] text-slate-300 mt-1 space-y-0.5">
                    {importStatus.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Validation Warnings / Error Rows Summary */}
          {parseResult.invalidRows.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {parseResult.invalidRows.length} Invalid Rows Skipped
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                {parseResult.invalidRows.map((inv, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-2 rounded-lg text-[11px] text-slate-300 flex items-start justify-between">
                    <span className="font-semibold text-amber-400">Row {inv.rowNumber}</span>
                    <span className="text-rose-300">{inv.errors.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-400" /> MCQ Preview ({parseResult.validItems.length} Valid Rows)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Showing first 20 items
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <th className="p-3">#</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Topic / Subtopic</th>
                    <th className="p-3">Question</th>
                    <th className="p-3 text-center">Correct</th>
                    <th className="p-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {parseResult.validItems.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-emerald-400">{item.subject}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{item.topic}</div>
                        {item.subtopic && <div className="text-[10px] text-slate-400">{item.subtopic}</div>}
                      </td>
                      <td className="p-3 max-w-md">
                        <p className="line-clamp-2 text-slate-200">{item.question}</p>
                        <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-2">
                          <span>A: {item.option_a}</span>
                          <span>B: {item.option_b}</span>
                          <span>C: {item.option_c}</span>
                          <span>D: {item.option_d}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md font-bold font-mono text-xs">
                          {item.correct_option}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] capitalize">
                          {item.difficulty || 'medium'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
