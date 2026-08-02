import React, { useState } from 'react';
import { TestResult } from '../types';
import { downloadQuizPdf } from '../lib/pdfGenerator';
import { PdfWatermarkOverlay } from '../lib/pdfWatermark';
import { Printer, Download, X } from 'lucide-react';

interface PrintableTestModalProps {
  result: TestResult;
  onClose: () => void;
}

export const PrintableTestModal: React.FC<PrintableTestModalProps> = ({ result, onClose }) => {
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const containsUrdu = (text: string) =>
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || '');

  const isUrduOrIslamiat =
    ['urdu', 'islam', 'din'].some((term) => (result.config?.subject || '').toLowerCase().includes(term)) ||
    result.questions.some((q) => containsUrdu(q.q) || q.options.some((o) => containsUrdu(o)));

  const urduChoiceLabels = ['الف', 'ب', 'ج', 'د'];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      const gradeOrPath = `Class ${result.config?.classNum}${result.config?.group ? ` (${result.config.group})` : ''}`;
      await downloadQuizPdf({
        subject: result.config?.subject || 'Practice Test',
        gradeOrPath,
        questions: result.questions,
        includeAnswers: includeAnswerKey,
      });
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setPdfError(
        isUrduOrIslamiat
          ? 'پی ڈی ایف فائل تیار کرنے میں دشواری پیش آئی۔ براہ کرم پرنٹ کے بٹن سے پرنٹ یا Save as PDF کا انتخاب کریں۔'
          : 'Could not generate PDF directly. You can use the Print button to Save as PDF.'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center no-print-bg">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-auto text-sm print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 printable-paper-root relative overflow-hidden">
        {/* Background Repeating Diagonal Watermark */}
        <PdfWatermarkOverlay />

        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex flex-col gap-3 mb-6 pb-4 border-b border-slate-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{isUrduOrIslamiat ? 'جوابات اور وضاحت شامل کریں' : 'Include Answer Key & Explanations'}</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDownloadingPdf ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <Download className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {isDownloadingPdf
                    ? (isUrduOrIslamiat ? 'تیار ہو رہا ہے...' : 'Generating...')
                    : (isUrduOrIslamiat ? 'پی ڈی ایف ڈاؤن لوڈ' : 'Download PDF')}
                </span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{isUrduOrIslamiat ? 'پرنٹ کریں' : 'Print'}</span>
              </button>

              <button onClick={onClose} className="p-2 text-slate-700 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {pdfError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs p-2.5 rounded-xl flex items-center justify-between">
              <span>{pdfError}</span>
              <button onClick={() => setPdfError(null)} className="font-bold underline ml-2 cursor-pointer">Dismiss</button>
            </div>
          )}
        </div>

        {/* PRINTABLE TEST PAPER BODY */}
        <div
          dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}
          className={`print-content relative z-10 space-y-6 ${
            isUrduOrIslamiat ? 'text-right font-["Noto_Nastaliq_Urdu","Noto_Sans_Arabic",serif]' : ''
          }`}
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-slate-900">
              {isUrduOrIslamiat ? 'ایس ایچ ایس ورچوئل اکیڈمی' : 'SHS Virtual Academy'}
            </h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
              {isUrduOrIslamiat ? `امتحانی مشقی پرچہ — ${result.config.subject}` : `Practice Examination Paper — ${result.config.subject}`}
            </p>

            <div className={`grid grid-cols-2 gap-2 text-xs text-slate-700 mt-4 pt-3 border-t border-slate-200 ${isUrduOrIslamiat ? 'text-right' : 'text-left'}`}>
              <div>
                <strong>{isUrduOrIslamiat ? 'طالب علم کا نام:' : 'Student Name:'}</strong> ______________________
              </div>
              <div>
                <strong>{isUrduOrIslamiat ? 'رول نمبر:' : 'Roll / ID No:'}</strong> ______________________
              </div>
              <div>
                <strong>{isUrduOrIslamiat ? 'کلاس / گروہ:' : 'Syllabus Path:'}</strong> Class {result.config.classNum} ({result.config.group})
              </div>
              <div>
                <strong>{isUrduOrIslamiat ? 'کُل وقت:' : 'Time Allowed:'}</strong> {result.config.durationMinutes} {isUrduOrIslamiat ? 'منٹ' : 'Minutes'}
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-5">
            {result.questions.map((q, idx) => (
              <div key={q.id || idx} className="space-y-1.5 break-inside-avoid">
                <p className="font-semibold text-slate-900 leading-snug">
                  {isUrduOrIslamiat ? `سوال ${idx + 1}.` : `Q${idx + 1}.`} {q.q}
                </p>
                <div className={`grid grid-cols-2 gap-2 ${isUrduOrIslamiat ? 'pr-4' : 'pl-4'} text-xs text-slate-800`}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <span className="font-semibold">
                        {isUrduOrIslamiat ? `${urduChoiceLabels[oIdx]})` : `${String.fromCharCode(65 + oIdx)})`}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Optional Answer Key Page */}
          {includeAnswerKey && (
            <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-400 break-before-page space-y-4">
              <div className="text-center pb-2">
                <h2 className="font-serif text-lg font-bold text-slate-900 uppercase">
                  {isUrduOrIslamiat ? 'جوابات اور اہم نکات' : 'Official Answer Key & Explanations'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isUrduOrIslamiat ? 'ایس ایچ ایس ورچوئل اکیڈمی راہنمائی حل' : 'SHS Virtual Academy Guidance Solutions'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                {result.questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900">
                      {isUrduOrIslamiat
                        ? `سوال ${idx + 1}. صحیح جواب: آپشن (${urduChoiceLabels[q.correct]}) — ${q.options[q.correct]}`
                        : `Q${idx + 1}. Correct Answer: Option ${String.fromCharCode(65 + q.correct)} (${q.options[q.correct]})`}
                    </p>
                    <p className="text-slate-600 mt-1">
                      <strong>{isUrduOrIslamiat ? 'وضاحت:' : 'Explanation:'}</strong> {q.explain}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
