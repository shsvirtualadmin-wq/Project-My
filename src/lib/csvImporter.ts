export interface MCQImportItem {
  subject: string;
  topic: string;
  subtopic?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // 'A' | 'B' | 'C' | 'D'
  explanation?: string;
  difficulty?: string;
  source?: string;
  class_num?: number;
}

export interface CSVRowError {
  rowNumber: number;
  rawRow: string[];
  errors: string[];
}

export interface CSVParseResult {
  headers: string[];
  missingRequiredHeaders: string[];
  recognizedHeaderMap: Record<string, string>;
  validItems: MCQImportItem[];
  invalidRows: CSVRowError[];
  totalRowsParsed: number;
}

/**
 * Robust CSV Line Splitter supporting quoted values with commas and newlines
 */
export function parseCSVRaw(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentVal.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Helper to normalize header string to standard key
 */
function normalizeHeaderName(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (clean === 'subject') return 'subject';
  if (clean === 'topic') return 'topic';
  if (clean === 'subtopic' || clean === 'subtopicname' || clean === 'sub') return 'subtopic';
  if (clean === 'question' || clean === 'questiontext' || clean === 'qtext' || clean === 'q') return 'question';
  
  if (clean === 'optiona' || clean === 'option1' || clean === 'opta' || clean === 'a') return 'option_a';
  if (clean === 'optionb' || clean === 'option2' || clean === 'optb' || clean === 'b') return 'option_b';
  if (clean === 'optionc' || clean === 'option3' || clean === 'optc' || clean === 'c') return 'option_c';
  if (clean === 'optiond' || clean === 'option4' || clean === 'optd' || clean === 'd') return 'option_d';

  if (
    clean === 'correctoption' ||
    clean === 'correctanswer' ||
    clean === 'correctindex' ||
    clean === 'answer' ||
    clean === 'ans' ||
    clean === 'correct'
  ) {
    return 'correct_option';
  }

  if (clean === 'explanation' || clean === 'explain' || clean === 'reason') return 'explanation';
  if (clean === 'difficulty' || clean === 'level') return 'difficulty';
  if (clean === 'source' || clean === 'author' || clean === 'tag') return 'source';
  if (clean === 'class' || clean === 'classnum' || clean === 'grade') return 'class_num';

  return clean;
}

/**
 * Parse and Validate CSV string into MCQImportItem array
 */
export function parseAndValidateMCQCSV(csvText: string): CSVParseResult {
  const allRows = parseCSVRaw(csvText);

  if (allRows.length === 0) {
    return {
      headers: [],
      missingRequiredHeaders: ['subject', 'topic', 'question', 'correct_option'],
      recognizedHeaderMap: {},
      validItems: [],
      invalidRows: [],
      totalRowsParsed: 0,
    };
  }

  const rawHeaders = allRows[0];
  const headerIndexMap: Record<string, number> = {};
  const recognizedHeaderMap: Record<string, string> = {};

  rawHeaders.forEach((h, idx) => {
    const norm = normalizeHeaderName(h);
    headerIndexMap[norm] = idx;
    recognizedHeaderMap[norm] = h;
  });

  const requiredKeys = ['subject', 'topic', 'question', 'correct_option'];
  const missingRequiredHeaders = requiredKeys.filter((k) => headerIndexMap[k] === undefined);

  if (missingRequiredHeaders.length > 0) {
    return {
      headers: rawHeaders,
      missingRequiredHeaders,
      recognizedHeaderMap,
      validItems: [],
      invalidRows: [],
      totalRowsParsed: allRows.length - 1,
    };
  }

  const validItems: MCQImportItem[] = [];
  const invalidRows: CSVRowError[] = [];

  const getCol = (row: string[], key: string): string => {
    const idx = headerIndexMap[key];
    if (idx !== undefined && row[idx] !== undefined) {
      return row[idx].trim();
    }
    return '';
  };

  for (let r = 1; r < allRows.length; r++) {
    const row = allRows[r];
    const rowErrors: string[] = [];

    const subject = getCol(row, 'subject');
    const topic = getCol(row, 'topic');
    const subtopic = getCol(row, 'subtopic') || 'General';
    const question = getCol(row, 'question');
    const option_a = getCol(row, 'option_a');
    const option_b = getCol(row, 'option_b');
    const option_c = getCol(row, 'option_c');
    const option_d = getCol(row, 'option_d');
    const rawCorrect = getCol(row, 'correct_option');
    const explanation = getCol(row, 'explanation') || 'No detailed explanation provided.';
    const difficultyRaw = getCol(row, 'difficulty').toLowerCase() || 'medium';
    const source = getCol(row, 'source') || 'admin-bulk-import';
    const classNumRaw = getCol(row, 'class_num');

    if (!subject) rowErrors.push('Missing Subject');
    if (!topic) rowErrors.push('Missing Topic');
    if (!question) rowErrors.push('Missing Question text');
    if (!option_a || !option_b) rowErrors.push('Options A & B are required');

    // Normalize Correct Option
    let correct_option = '';
    const cleanCorrect = rawCorrect.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(cleanCorrect)) {
      correct_option = cleanCorrect;
    } else if (['1', '0'].includes(cleanCorrect)) {
      correct_option = cleanCorrect === '0' || cleanCorrect === '1' ? 'A' : 'B';
    } else if (cleanCorrect === '2') {
      correct_option = 'B';
    } else if (cleanCorrect === '3') {
      correct_option = 'C';
    } else if (cleanCorrect === '4') {
      correct_option = 'D';
    } else if (option_a && rawCorrect.toLowerCase() === option_a.toLowerCase()) {
      correct_option = 'A';
    } else if (option_b && rawCorrect.toLowerCase() === option_b.toLowerCase()) {
      correct_option = 'B';
    } else if (option_c && rawCorrect.toLowerCase() === option_c.toLowerCase()) {
      correct_option = 'C';
    } else if (option_d && rawCorrect.toLowerCase() === option_d.toLowerCase()) {
      correct_option = 'D';
    } else {
      rowErrors.push(`Invalid correct_option "${rawCorrect}" (Must be A, B, C, or D)`);
    }

    let difficulty = 'medium';
    if (['easy', 'medium', 'hard'].includes(difficultyRaw)) {
      difficulty = difficultyRaw;
    }

    let class_num: number | undefined = undefined;
    if (classNumRaw) {
      const parsedNum = parseInt(classNumRaw, 10);
      if (!isNaN(parsedNum)) class_num = parsedNum;
    }

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber: r + 1,
        rawRow: row,
        errors: rowErrors,
      });
    } else {
      validItems.push({
        subject,
        topic,
        subtopic,
        question,
        option_a,
        option_b,
        option_c: option_c || 'None of the above',
        option_d: option_d || 'All of the above',
        correct_option,
        explanation,
        difficulty,
        source,
        ...(class_num ? { class_num } : {}),
      });
    }
  }

  return {
    headers: rawHeaders,
    missingRequiredHeaders: [],
    recognizedHeaderMap,
    validItems,
    invalidRows,
    totalRowsParsed: allRows.length - 1,
  };
}

/**
 * Downloadable Sample CSV generator
 */
export function generateSampleCSV(): string {
  const sampleHeaders = [
    'subject',
    'topic',
    'subtopic',
    'question',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_option',
    'explanation',
    'difficulty',
    'source',
    'class_num',
  ];

  const sampleRows = [
    [
      'Biology',
      'Cell Biology',
      'Cell Organelles',
      'Which organelle is responsible for lipid synthesis and drug detoxification?',
      'Rough Endoplasmic Reticulum',
      'Smooth Endoplasmic Reticulum',
      'Golgi Apparatus',
      'Lysosome',
      'B',
      'Smooth ER synthesizes lipids and neutralizes toxins in liver cells.',
      'easy',
      'sample-import',
      '11',
    ],
    [
      'Physics',
      'Work and Energy',
      'Kinetic Energy',
      'If the velocity of an object is doubled, its kinetic energy becomes how many times?',
      '2 times',
      '4 times',
      '8 times',
      'Unchanged',
      'B',
      'Kinetic Energy KE = 0.5 * m * v^2. Doubling v quadruples KE.',
      'medium',
      'sample-import',
      '11',
    ],
    [
      'Chemistry',
      'Chemical Equilibrium',
      'Le Chatelier Principle',
      'Increasing pressure on a gaseous equilibrium system shifts reaction towards side with:',
      'Greater volume',
      'Fewer moles of gas',
      'Equal moles',
      'No effect',
      'B',
      'Higher pressure favors the direction producing fewer gas molecules.',
      'medium',
      'sample-import',
      '12',
    ],
  ];

  const escapeField = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent =
    sampleHeaders.map(escapeField).join(',') +
    '\n' +
    sampleRows.map((row) => row.map(escapeField).join(',')).join('\n');

  return csvContent;
}
