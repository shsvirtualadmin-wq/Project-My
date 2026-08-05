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
  Search,
  Trash2,
  Tag,
  Shield,
  Download,
} from 'lucide-react';
import { StudentProfile, User } from '../lib/supabase';

export interface DriveFileItem {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  createdTime?: string;
  mimeType?: string;
  size?: number | string;
  category?: string;
  source?: string;
}

export interface PastPapersSectionProps {
  isAdmin?: boolean;
  userProfile?: StudentProfile | null;
  currentUser?: User | null;
}

export const PastPapersSection: React.FC<PastPapersSectionProps> = ({
  isAdmin = false,
  userProfile,
  currentUser,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Form fields
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

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
    if (!documentTitle) {
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMessage("Unauthorized: Only administrators are permitted to upload study resources.");
      return;
    }

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
      formData.append('title', documentTitle.trim() || selectedFile.name);
      formData.append('category', selectedCategory);
      if (currentUser?.email) {
        formData.append('adminEmail', currentUser.email);
      }

      const res = await fetch('/api/drive-upload', {
        method: 'POST',
        headers: {
          'X-Admin-Email': currentUser?.email || 'shsvirtualadmin@gmail.com',
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      setSuccessMessage(`Successfully published resource "${data.name || selectedFile.name}"!`);
      setSelectedFile(null);
      setDocumentTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh file list
      await fetchDriveFiles();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to upload past paper document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    setDeletingId(fileId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/drive-delete/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': currentUser?.email || 'shsvirtualadmin@gmail.com',
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete file.");
      }

      setSuccessMessage(`Removed "${fileName}" successfully.`);
      fetchDriveFiles();
    } catch (err: any) {
      setErrorMessage(err.message || "Error removing past paper.");
    } finally {
      setDeletingId(null);
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

  const categories = ['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'MDCAT', 'TCAT', 'General'];

  // Filter logic
  const filteredFiles = files.filter(f => {
    const matchesSearch = !searchQuery || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategoryFilter === 'All' || 
      f.category === activeCategoryFilter || 
      f.name.toLowerCase().includes(activeCategoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                Past Papers & Study Resources
              </h2>
              {isAdmin && (
                <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin Portal
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAdmin
                ? "Manage official FBISE past papers, MDCAT/TCAT entry test documents, and study resources for students."
                : "Official FBISE board past papers, MDCAT & TCAT preparation resources, and model test documents."}
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

      {/* Admin Upload Control Panel - Exclusively Visible to Admins */}
      {isAdmin && (
        <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-rose-500" />
              <span>Upload Past Paper Document (Admin Only)</span>
            </h3>
            <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-md">
              ADMIN UPLOADER
            </span>
          </div>

          <form onSubmit={handleUpload} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 11 Physics 2024 FBISE Past Paper"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Category / Track
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="General">General / All Students</option>
                  <option value="Class 9">Class 9 (FBISE)</option>
                  <option value="Class 10">Class 10 (FBISE)</option>
                  <option value="Class 11">Class 11 (Pre-Med / Pre-Eng / CS)</option>
                  <option value="Class 12">Class 12 (Pre-Med / Pre-Eng / CS)</option>
                  <option value="MDCAT">MDCAT Medical Prep</option>
                  <option value="TCAT">TCAT Engineering Prep</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
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
                    Click to attach file <span className="text-rose-500 font-bold">(PDF or Image, max 15MB)</span>
                  </span>
                )}
              </label>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading Resource...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Upload Resource
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Accepted Formats: <code className="text-rose-500 font-bold">PDF, JPG, PNG, WEBP</code> • Max File Size: <code className="text-rose-500 font-bold">15 MB</code>
            </p>
          </form>

          {/* Status Alerts */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar for All Users */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search past papers by title, subject, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Files List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>Available Papers & Resources ({filteredFiles.length})</span>
            </h3>
            {isLoadingList && (
              <span className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching documents...
              </span>
            )}
          </div>

          {isLoadingList ? (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Loading study resources...
              </p>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-rose-400 dark:hover:border-rose-500/50 rounded-2xl p-4 flex items-center justify-between gap-3 group transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="p-2.5 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                      {getFileIcon(file.name, file.mimeType)}
                    </div>
                    <div className="overflow-hidden space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 dark:text-slate-400">
                        {file.category && file.category !== 'General' && (
                          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" /> {file.category}
                          </span>
                        )}
                        {file.createdTime && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(file.createdTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* View / Download Button */}
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      title="View / Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </a>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id, file.name)}
                        disabled={deletingId === file.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                        title="Delete document (Admin)"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {searchQuery || activeCategoryFilter !== 'All'
                  ? "No matching past papers found"
                  : "No study resources available yet"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isAdmin
                  ? "Use the admin upload box above to upload past papers or study resources for students."
                  : "Your course instructor or administrator will upload official FBISE past papers and study guides here shortly."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
