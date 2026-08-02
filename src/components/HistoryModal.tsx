import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { History, X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface HistoryModalProps {
  history: HistoryItem[];
  onClearHistory: () => Promise<void> | void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onClearHistory,
  onClose,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const getItemPct = (item: HistoryItem): number => {
    if (typeof item.percentage === 'number' && !isNaN(item.percentage) && item.percentage > 0) return item.percentage;
    const score = Number(item.score ?? 0);
    const total = Number(item.total ?? 0);
    if (total > 0) return Math.round((score / total) * 100);
    return typeof item.percentage === 'number' && !isNaN(item.percentage) ? item.percentage : 0;
  };

  const avgPct = history.length
    ? Math.round(history.reduce((acc, curr) => acc + getItemPct(curr), 0) / history.length)
    : 0;

  const totalAttempted = history.reduce((acc, curr) => acc + curr.total, 0);

  const handleConfirmClear = async () => {
    setIsClearing(true);
    setClearError(null);
    try {
      if (onClearHistory) {
        await onClearHistory();
      }
      setShowConfirm(false);
    } catch (err: any) {
      console.error('Error in onClearHistory:', err);
      setClearError(err?.message || 'Failed to clear history from server. Please check connection.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/10 rounded-t-[32px] sm:rounded-[32px] p-6 max-w-lg w-full shadow-2xl relative animate-ios-spring">
        <div className="w-9 h-1 bg-black/10 dark:bg-white/20 rounded-full mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[#0A0A0A] dark:text-[#F2B90C] text-lg font-bold mb-4">
          <History className="w-5 h-5 text-[#F2B90C]" />
          <span>Test History &amp; Analytics</span>
        </div>

        {/* Confirmation Warning Dialog */}
        {showConfirm && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 animate-ios-spring space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-[#F2B90C] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-slate-900 dark:text-white">Clear test history from your view?</p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  This will hide all your past test history, reset your total MCQs solved and average accuracy metrics to 0 on your dashboard, and start fresh. Your historic records remain securely saved for teacher &amp; admin analytics.
                </p>
              </div>
            </div>

            {clearError && (
              <div className="text-xs bg-rose-500/20 text-rose-800 dark:text-rose-200 p-2.5 rounded-xl border border-rose-500/30 font-bold">
                {clearError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                disabled={isClearing}
                onClick={() => {
                  setShowConfirm(false);
                  setClearError(null);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isClearing}
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Clear All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-slate-50 dark:bg-[#151515] border border-black/10 dark:border-white/10 p-3.5 rounded-2xl shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">Average Accuracy</span>
            <span className="text-2xl font-extrabold text-[#0A0A0A] dark:text-[#F2B90C]">{avgPct}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#151515] border border-black/10 dark:border-white/10 p-3.5 rounded-2xl shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">Total MCQs Solved</span>
            <span className="text-2xl font-extrabold text-[#0A0A0A] dark:text-white">{totalAttempted}</span>
          </div>
        </div>

        {/* History List Grouped Cell */}
        <div className="bg-slate-50 dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-[22px] divide-y divide-black/5 dark:divide-white/10 max-h-60 overflow-y-auto mb-5 shadow-xs">
          {history.length === 0 ? (
            <div className="py-8 text-center px-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No practice test history recorded yet.</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Complete a practice test to view accuracy, scores, and time metrics here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div>
                  <span className="font-extrabold text-[#0A0A0A] dark:text-white block">{item.subject}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                    {item.pathLabel} &middot; {item.dateStr}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-[#0A0A0A] dark:text-[#F2B90C] text-sm block">
                    {item.percentage}%
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {item.score}/{item.total} ({item.timeTaken})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          {history.length > 0 && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isClearing}
              className="px-4 py-3 bg-rose-100 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-500/25 font-extrabold rounded-full text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white font-extrabold py-3 rounded-full cursor-pointer text-xs active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
