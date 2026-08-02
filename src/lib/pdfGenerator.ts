import { Question } from '../types';
import { getWatermarkHtmlOverlay } from './pdfWatermark';

interface PdfOptions {
  subject: string;
  gradeOrPath?: string;
  questions: Question[];
  includeAnswers?: boolean;
  studentName?: string;
}

const BOARDLY_LOGO_SVG = `<div style="width: 48px; height: 48px; background: #0A0A0A; border: 1.5px solid #F2B90C; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px;">
  <img src="/logo.png" style="width: 100%; height: 100%; object-fit: contain;" />
</div>`;

/**
 * Checks if a string contains Urdu or Arabic script characters
 */
function containsUrdu(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Generates and downloads a clean, branded PDF worksheet or study guide
 * with full Unicode UTF-8 Urdu font support (Noto Nastaliq Urdu / Noto Sans Arabic)
 */
export async function downloadQuizPdf({
  subject,
  gradeOrPath = 'General Practice',
  questions,
  includeAnswers = false,
  studentName,
}: PdfOptions): Promise<void> {
  // Create temporary container for rendering HTML to Canvas
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width at 96DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a'; // slate-900
  container.style.fontFamily = "'Noto Nastaliq Urdu', 'Noto Sans Arabic', 'Inter', -apple-system, sans-serif";
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';
  container.style.opacity = '1'; // Ensure opacity is 1 so html2canvas renders non-transparent content
  container.style.visibility = 'visible';
  container.style.pointerEvents = 'none';

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isUrduOrIslamiat =
    ['urdu', 'islam', 'din'].some((term) => (subject || '').toLowerCase().includes(term)) ||
    questions.some((q) => containsUrdu(q.q) || q.options.some((opt) => containsUrdu(opt)));

  const mainFont = "'Noto Nastaliq Urdu', 'Noto Sans Arabic', 'Inter', sans-serif";
  const urduChoiceLabels = ['الف', 'ب', 'ج', 'د'];

  const customLogoUrl = typeof window !== 'undefined' ? localStorage.getItem('boardly_logo_url') : null;
  const activeLogo = customLogoUrl || '/logo.png';
  const logoContent = `<img src="${activeLogo}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />`;

  // Build HTML representation with RTL & Unicode font support (using inline SVG/image)
  let html = `
    <div style="position: relative; width: 100%; min-height: 100%; background-color: #ffffff;">
      ${getWatermarkHtmlOverlay(customLogoUrl)}
      <div dir="${isUrduOrIslamiat ? 'rtl' : 'ltr'}" style="position: relative; z-index: 1; font-family: ${mainFont}; text-align: ${isUrduOrIslamiat ? 'right' : 'left'}; line-height: 1.8;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            ${logoContent}
          </div>
          <div>
            <h1 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: 0.5px; font-family: 'Inter', -apple-system, sans-serif;">
              SHS VIRTUAL ACADEMY — BOARDLY
            </h1>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0; font-weight: 600;">
              ${isUrduOrIslamiat ? `آفیشل امتحانی مشق ورک شیٹ • ${subject}` : `Official Exam Practice Worksheet • ${subject}`}
            </p>
          </div>
        </div>
      </div>

      <!-- Metadata Box -->
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 11px; color: #334155; text-align: ${isUrduOrIslamiat ? 'right' : 'left'};">
        <div><strong>${isUrduOrIslamiat ? 'مضمون:' : 'Subject:'}</strong> ${subject}</div>
        <div><strong>${isUrduOrIslamiat ? 'کل سوالات:' : 'Total Questions:'}</strong> ${questions.length}</div>
        <div><strong>${isUrduOrIslamiat ? 'طالب علم:' : 'Student:'}</strong> ${studentName || '_________________'}</div>
        <div><strong>${isUrduOrIslamiat ? 'کلاس / گروہ:' : 'Path/Grade:'}</strong> ${gradeOrPath}</div>
        <div><strong>${isUrduOrIslamiat ? 'تاریخ:' : 'Date:'}</strong> ${dateStr}</div>
        <div><strong>${isUrduOrIslamiat ? 'رول نمبر:' : 'Roll No:'}</strong> _________________</div>
      </div>

      <!-- Questions List -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
  `;

  questions.forEach((q, idx) => {
    const isUrduQ = isUrduOrIslamiat || containsUrdu(q.q);
    const qDir = isUrduQ ? 'rtl' : 'ltr';
    const qAlign = isUrduQ ? 'right' : 'left';
    const qFont = isUrduQ ? "'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif" : "'Inter', sans-serif";

    html += `
      <div style="page-break-inside: avoid; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
        <div dir="${qDir}" style="font-size: 13px; font-weight: 700; color: #0f172a; text-align: ${qAlign}; font-family: ${qFont}; line-height: 1.8; margin-bottom: 8px;">
          <span style="color: #007AFF; font-family: 'Inter', sans-serif; font-weight: 800; ${isUrduQ ? 'margin-left: 6px;' : 'margin-right: 6px;'}">${isUrduQ ? `سوال ${idx + 1}.` : `Q${idx + 1}.`}</span>
          ${q.q}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: ${isUrduQ ? '0' : '16px'}; margin-right: ${isUrduQ ? '16px' : '0'};">
    `;

    q.options.forEach((opt, oIdx) => {
      const isUrduOpt = isUrduOrIslamiat || containsUrdu(opt);
      const optDir = isUrduOpt ? 'rtl' : 'ltr';
      const optAlign = isUrduOpt ? 'right' : 'left';
      const optFont = isUrduOpt ? "'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif" : "'Inter', sans-serif";
      const letter = isUrduOpt ? urduChoiceLabels[oIdx] || String.fromCharCode(65 + oIdx) : String.fromCharCode(65 + oIdx);

      html += `
        <div dir="${optDir}" style="font-size: 11px; color: #334155; text-align: ${optAlign}; font-family: ${optFont}; display: flex; align-items: center; gap: 6px; line-height: 1.6; background-color: #fafafa; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 6px;">
          <span style="font-weight: 700; color: #64748b; font-family: ${isUrduOpt ? "'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif" : "'Inter', sans-serif"};">[   ] ${letter}.</span>
          <span>${opt}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `</div>`;

  // Optional Answer Key & Explanations Page
  if (includeAnswers) {
    html += `
      <div style="page-break-before: always; margin-top: 36px; padding-top: 24px; border-top: 2px dashed #cbd5e1;" dir="${isUrduOrIslamiat ? 'rtl' : 'ltr'}">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${mainFont};">
            ${isUrduOrIslamiat ? 'جوابات اور اہم وضاحت' : 'Official Answer Key & Explanations'}
          </h2>
          <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0; font-family: ${mainFont};">
            ${isUrduOrIslamiat ? 'ایس ایچ ایس ورچوئل اکیڈمی راہنمائی حل' : 'Detailed guidance solutions provided by SHS Virtual Academy'}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
    `;

    questions.forEach((q, idx) => {
      const isUrduAns = isUrduOrIslamiat || containsUrdu(q.options[q.correct] || '') || containsUrdu(q.explain || '');
      const correctLetter = isUrduAns ? urduChoiceLabels[q.correct] || String.fromCharCode(65 + q.correct) : String.fromCharCode(65 + q.correct);
      const correctOptText = q.options[q.correct] || '';
      const ansDir = isUrduAns ? 'rtl' : 'ltr';
      const ansAlign = isUrduAns ? 'right' : 'left';
      const ansFont = isUrduAns ? "'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif" : "'Inter', sans-serif";

      html += `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 11px;">
          <div dir="${ansDir}" style="font-weight: 700; color: #0f172a; text-align: ${ansAlign}; font-family: ${ansFont}; margin-bottom: 4px;">
            <span style="color: #10b981;">${isUrduAns ? `سوال ${idx + 1}. صحیح جواب:` : `Q${idx + 1}. Correct Answer:`}</span>
            ${isUrduAns ? `آپشن (${correctLetter}) - ${correctOptText}` : `Option ${correctLetter} (${correctOptText})`}
          </div>
          <div dir="${ansDir}" style="color: #475569; text-align: ${ansAlign}; font-family: ${ansFont}; font-size: 10.5px; line-height: 1.6;">
            <strong>${isUrduAns ? 'وضاحت:' : 'Explanation:'}</strong> ${q.explain || (isUrduAns ? 'کوئی تفصیل فراہم نہیں کی گئی۔' : 'No detailed explanation provided.')}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  html += `</div></div>`;

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // Wait for fonts & rendering
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    await new Promise((resolve) => setTimeout(resolve, 300));

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const canvas = await html2canvas(container, {
      scale: 2, // High resolution crispness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1000,
      windowHeight: Math.max(1200, container.scrollHeight + 100),
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering failed to capture layout.');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let pageIndex = 0;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 2) {
      pageIndex++;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -(pageIndex * pdfHeight), imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const cleanSubject = (subject || 'Quiz').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanGrade = (gradeOrPath || 'Practice').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Boardly_${cleanSubject}_${cleanGrade}_Quiz.pdf`;

    pdf.save(fileName);
  } catch (err) {
    console.error('Error rendering UTF-8 Urdu PDF:', err);
    throw err; // Rethrow so the calling component can display a visible error state
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

