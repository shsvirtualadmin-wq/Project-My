import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  Building2,
  AlertCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StudentProfile, User, submitPaymentProofApi, PaymentRequest } from '../lib/supabase';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  studentProfile: StudentProfile | null;
  onSubmitted?: (newRequest: PaymentRequest) => void;
}

const PAYMENT_METHODS = [
  {
    id: 'JazzCash',
    name: 'JazzCash',
    number: '+92 305 8969050',
    title: 'Haseena Bibi',
    badge: 'Mobile Wallet',
    color: 'from-amber-500 to-red-600',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    bgLight: 'bg-amber-500/5 dark:bg-amber-500/10',
  },
  {
    id: 'SadaPay',
    name: 'SadaPay',
    number: '+92 349 0744686',
    title: 'Raheela Ferdous',
    badge: 'Digital Bank',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    bgLight: 'bg-emerald-500/5 dark:bg-emerald-500/10',
  },
  {
    id: 'NayaPay',
    name: 'NayaPay',
    number: '+92 349 0744686',
    title: 'Raheela Ferdous',
    badge: 'Digital Bank',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/30 dark:border-cyan-500/40',
    bgLight: 'bg-cyan-500/5 dark:bg-cyan-500/10',
  },
  {
    id: 'Easypaisa',
    name: 'Easypaisa',
    number: '+92 333 5292094',
    title: 'Sadia Fatima',
    badge: 'Mobile Wallet',
    color: 'from-green-500 to-emerald-700',
    border: 'border-green-500/30 dark:border-green-500/40',
    bgLight: 'bg-green-500/5 dark:bg-green-500/10',
  },
];

const PRICING_TIERS = [
  { id: 'Matric', title: 'Matric', subtitle: '9th & 10th Class', fee: '499', label: 'Matric (9th/10th)', desc: 'Full MCQ Bank & Past Papers' },
  { id: 'FSc', title: 'FSc', subtitle: '1st & 2nd Year', fee: '999', label: 'FSc (1st/2nd Year)', desc: 'Pre-Med & Engineering' },
  { id: 'MDCAT', title: 'MDCAT', subtitle: 'Medical Entry Test', fee: '1499', label: 'MDCAT Prep', desc: 'Complete MDCAT Prep' },
  { id: 'TCAT / ECAT', title: 'TCAT / ECAT', subtitle: 'Engineering Entry Test', fee: '1499', label: 'TCAT / ECAT', desc: 'ECAT Prep & Mocks' },
];

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  studentProfile,
  onSubmitted,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('JazzCash');
  const [selectedTier, setSelectedTier] = useState<string>(() => {
    const grade = (studentProfile?.grade || '').toLowerCase();
    if (grade.includes('matric') || grade.includes('9th') || grade.includes('10th')) return 'Matric';
    if (grade.includes('fsc') || grade.includes('11th') || grade.includes('12th')) return 'FSc';
    if (grade.includes('mdcat') || grade.includes('medical')) return 'MDCAT';
    return 'TCAT / ECAT';
  });

  const [amount, setAmount] = useState<string>(() => {
    const grade = (studentProfile?.grade || '').toLowerCase();
    if (grade.includes('matric') || grade.includes('9th') || grade.includes('10th')) return '499';
    if (grade.includes('fsc') || grade.includes('11th') || grade.includes('12th')) return '999';
    return '1499';
  });

  const [transactionRef, setTransactionRef] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>(() => {
    return currentUser?.email || studentProfile?.email || '';
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<PaymentRequest | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectTier = (tierId: string, fee: string) => {
    setSelectedTier(tierId);
    setAmount(fee);
    setError(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please select a valid image (PNG, JPG, WEBP) or PDF screenshot.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Please attach a screenshot of your payment confirmation receipt.');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    const studentId = currentUser?.id || studentProfile?.id || `anon-${Date.now()}`;
    const resolvedEmail = (studentEmail || currentUser?.email || studentProfile?.email || '').trim();
    const studentName = studentProfile?.name || currentUser?.user_metadata?.full_name || 'Student';

    if (!resolvedEmail || !/\S+@\S+\.\S+/.test(resolvedEmail)) {
      setError('Please enter a valid email address to receive your confirmation receipt.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[PaymentProofModal] Submitting payment proof form:', {
        studentId,
        studentName,
        studentEmail: resolvedEmail,
        paymentMethod: selectedMethod,
        amount,
        selectedTier,
        transactionRef,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });

      const formData = new FormData();
      formData.append('student_id', studentId);
      formData.append('student_name', studentName);
      formData.append('student_email', resolvedEmail);
      formData.append('payment_method', selectedMethod);
      formData.append('amount', amount);
      formData.append('transaction_reference', transactionRef);
      formData.append('course_tier', selectedTier);
      formData.append('tier', selectedTier);
      formData.append('file', selectedFile);

      const res = await submitPaymentProofApi(formData);
      console.log('[PaymentProofModal] API submission response:', res);

      if (res.success && res.data) {
        setIsSuccess(true);
        setSubmittedData(res.data);
        if (onSubmitted) onSubmitted(res.data);
      } else {
        const errorMsg = res.error || 'Failed to submit payment proof. Please try again.';
        console.error('[PaymentProofModal] Submission failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('[PaymentProofModal] Exception during submission:', err);
      setError(err?.message || 'Error uploading payment proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl my-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Payment Verification</h2>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                Upload payment proof screenshot to upgrade your Boardly account
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6 text-slate-800 dark:text-slate-100">
          {isSuccess ? (
            /* Success View */
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payment Proof Submitted!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thanks for your payment! Our team will review your proof shortly and activate your premium access within <strong>2–4 hours</strong>.
                </p>
              </div>

              {submittedData && (
                <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                    <span className="text-slate-500 dark:text-zinc-400">Method</span>
                    <span className="font-bold">{submittedData.payment_method}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                    <span className="text-slate-500 dark:text-zinc-400">Amount</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">PKR {submittedData.amount}</span>
                  </div>
                  {submittedData.transaction_reference && (
                    <div className="flex justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 dark:text-zinc-400">Transaction ID</span>
                      <span className="font-bold font-mono">{submittedData.transaction_reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Status</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Payment Under Review
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-700 dark:text-blue-300 max-w-md mx-auto">
                📧 A welcome confirmation email has been sent to <strong>{submittedData?.student_email || currentUser?.email}</strong>.
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-md py-3.5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            /* Upload Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 0: Official Pricing Tiers Section */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-500/5 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Official Pricing Tiers</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">
                      Tap your course level to select the required fee before sending payment:
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                    1-Year Premium Access
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {PRICING_TIERS.map((tier) => {
                    const isTierSelected = selectedTier === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => handleSelectTier(tier.id, tier.fee)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isTierSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/40 scale-[1.02]'
                            : 'bg-white dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${isTierSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                              {tier.title}
                            </span>
                            {isTierSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                          </div>
                          <p className={`text-[10px] font-medium mt-0.5 ${isTierSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-zinc-400'}`}>
                            {tier.subtitle}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-baseline justify-between">
                          <span className={`text-[10px] font-bold ${isTierSelected ? 'text-emerald-100' : 'text-slate-400'}`}>Fee</span>
                          <span className={`text-sm font-black ${isTierSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            PKR {tier.fee}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Accepted Payment Methods List */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                  1. Official Accepted Payment Accounts (Tap to Copy)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    const isCopied = copiedId === method.id;

                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800/80'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-slate-900 dark:text-white">
                                {method.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                {method.badge}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">
                              Title: <strong className="text-slate-800 dark:text-zinc-200">{method.title}</strong>
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-zinc-800 flex justify-between items-center">
                          <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white tracking-wider">
                            {method.number}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(method.number, method.id);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-1 rounded-lg"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Fee Structure Quick Selector & Payment Details Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Select Your Grade / Test Course Fee Tier
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRICING_TIERS.map((tier) => {
                      const isTierSelected = selectedTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => handleSelectTier(tier.id, tier.fee)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isTierSelected
                              ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                              : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-[11px] font-bold truncate">{tier.label}</span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            PKR {tier.fee}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Your Email Address (For Confirmation Receipt) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Amount Paid (PKR) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          PKR
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 499, 999, or 1499"
                          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Transaction Reference / ID <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. TRX9823412"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Screenshot File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Payment Confirmation Screenshot <span className="text-red-500">*</span>
                </label>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50 dark:bg-zinc-900/40">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-4 p-2">
                      <div className="flex items-center gap-3 truncate">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Screenshot preview"
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div className="text-left truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload to Drive
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="relative z-20 p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-10 h-10 mx-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                          Click to upload screenshot
                        </span>{' '}
                        or drag and drop receipt
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                        PNG, JPG, WEBP or PDF (Max size 15MB) • Uploads directly to Google Drive
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security & No Refunds Notice */}
              <div className="p-3 bg-slate-100 dark:bg-zinc-900 rounded-xl space-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Your screenshot will be stored in our connected Google Drive folder for manual verification.</span>
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold pl-6">
                  All purchases are final — strict no-refunds policy.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-1/3 py-3 px-4 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Drive &amp; Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Payment Proof</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
