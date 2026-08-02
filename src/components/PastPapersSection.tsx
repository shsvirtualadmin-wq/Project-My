import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Image as ImageIcon,
  FolderOpen,
  Calendar,
} from 'lucide-react';

export interface DriveFileItem {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  createdTime?: string;
  mimeType?: string;
  size?: number | string;
}

export const PastPapersSection: React.FC = () => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDriveFiles = async () => {
    setIsLoadingList(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/drive-list');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch files (Status ${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFiles(data);
      } else if (data.files && Array.isArray(data.files)) {
        setFiles(data.files);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setFiles([]);
      }
    } catch (err: any) {
      console.error("Error loading Drive files:", err);
      setErrorMessage(err.message || "Unable to load past papers list.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDriveFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setSuccessMessage('');
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Client-side Validation: Size Max 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`File size is too large (${sizeMB}MB). Maximum allowed limit is 15MB.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Client-side Validation: File Extension / Mime (PDF and Images Only)
    const allowedMimePrefixes = ['image/'];
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '');
    const isAllowedMime = allowedMimes.includes(file.type) || allowedMimePrefixes.some(p => file.type.startsWith(p));

    if (!isAllowedExt && !isAllowedMime) {
      setErrorMessage("Invalid file type. Only PDF documents and image files (JPG, PNG, WEBP, GIF) are allowed.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/drive-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      setSuccessMessage(`Successfully uploaded "${data.name || selectedFile.name}" to Google Drive!`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh file list
      await fetchDriveFiles();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to upload file to Google Drive.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (name: string, mimeType?: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '') || mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-sky-500" />;
    }
    return <FileCode className="w-5 h-5 text-emerald-500" />;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
              Past Papers & Study Resources
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely stored on Google Drive • Upload FBISE past papers or access community resource files
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDriveFiles}
          disabled={isLoadingList}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin text-rose-500' : ''}`} />
          <span>Refresh Files</span>
        </button>
      </div>

      {/* Upload Form Box */}
      <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-rose-500" />
          <span>Upload Past Paper Document</span>
        </h3>

        <form onSubmit={handleUpload} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="past-paper-file-input"
            />
            
            <label
              htmlFor="past-paper-file-input"
              className="flex-1 border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-rose-500 dark:hover:border-rose-400 rounded-xl p-3 text-center cursor-pointer bg-white dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/40 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 truncate"
            >
              {selectedFile ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold truncate block">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Click to select file <span className="text-rose-500 font-bold">(PDF or Image, max 15MB)</span>
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Drive...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload File
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Allowed formats: <code className="text-rose-500 font-bold">PDF, JPG, PNG, WEBP</code> • Max File Size: <code className="text-rose-500 font-bold">15 MB</code>
          </p>
        </form>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
      </div>

      {/* Files List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Available Papers & Resources ({files.length})</span>
          </h3>
          {isLoadingList && (
            <span className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading files...
            </span>
          )}
        </div>

        {isLoadingList ? (
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Fetching Google Drive files...
            </p>
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-rose-400 dark:hover:border-rose-500/50 rounded-2xl p-4 flex items-center justify-between gap-3 group transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                    {getFileIcon(file.name, file.mimeType)}
                  </div>
                  <div className="overflow-hidden space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                      {file.name}
                    </h4>
                    {file.createdTime && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(file.createdTime)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-2 text-slate-400 group-hover:text-rose-500 transition-colors shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-2">
            <FolderOpen className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No files found in Drive folder
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload a past paper or resource document above to populate this list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
