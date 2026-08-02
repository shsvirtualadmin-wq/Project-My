import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface MCQRaw {
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

interface ChapterMCQs {
  topic: string;
  questions: MCQRaw[];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wbvzbbnapowwmrjecdyt.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('ERROR: VITE_SUPABASE_ANON_KEY is not defined in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('========================================================');
  console.log('BOARDLY 1ST YEAR MATHEMATICS MCQS SUPABASE SEEDER');
  console.log('Target Supabase URL:', supabaseUrl);
  console.log('========================================================\n');

  // Load dataset
  const jsonPath = path.join(process.cwd(), 'scripts', 'math_1st_year_mcqs.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Dataset file not found at ${jsonPath}`);
    process.exit(1);
  }

  const chapters: ChapterMCQs[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${chapters.length} chapters from JSON file.\n`);

  // Test table existence
  const { error: selectErr } = await supabase.from('mcqs').select('id').limit(1);
  if (selectErr && selectErr.code === 'PGRST205') {
    console.error('--------------------------------------------------------');
    console.error('CRITICAL ERROR: Table "public.mcqs" does not exist in Supabase!');
    console.error('Details:', selectErr.message);
    console.error('\nAction Required:');
    console.error('1. Open your Supabase Dashboard -> SQL Editor.');
    console.error('2. Execute the DDL script found in "scripts/create_mcqs_table.sql".');
    console.error('3. Re-run this seeding script: npx tsx scripts/seed_math_mcqs.ts');
    console.error('--------------------------------------------------------\n');
  }

  const chapterStatus: Array<{
    chapterIndex: number;
    topic: string;
    totalQuestions: number;
    inserted: number;
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    errorMessage?: string;
  }> = [];

  let overallTotalInserted = 0;

  for (let idx = 0; idx < chapters.length; idx++) {
    const ch = chapters[idx];
    const chNum = idx + 1;
    const topic = ch.topic;

    console.log(`Processing Chapter ${chNum}/16: "${topic}" (${ch.questions.length} MCQs)...`);

    const rowsToInsert = ch.questions.map((q, qIdx) => ({
      id: `math_c11_ch${String(chNum).padStart(2, '0')}_mcq${String(qIdx + 1).padStart(2, '0')}`,
      subject: 'Mathematics',
      topic: topic,
      class_number: 11,
      stream: 'Pre-Engineering',
      question_stem: q.q,
      options: q.options,
      correct_index: q.correct,
      explanation: q.explain,
      difficulty: 'Exam Standard',
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('mcqs')
      .upsert(rowsToInsert, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.error(`  ❌ Chapter ${chNum} ("${topic}") Insert Failed: ${error.message}`);
      chapterStatus.push({
        chapterIndex: chNum,
        topic,
        totalQuestions: ch.questions.length,
        inserted: 0,
        status: 'FAILED',
        errorMessage: error.message
      });
    } else {
      const insertedCount = data ? data.length : rowsToInsert.length;
      overallTotalInserted += insertedCount;
      console.log(`  ✅ Chapter ${chNum} ("${topic}") Successfully Inserted ${insertedCount} rows.`);
      chapterStatus.push({
        chapterIndex: chNum,
        topic,
        totalQuestions: ch.questions.length,
        inserted: insertedCount,
        status: 'SUCCESS'
      });
    }
  }

  console.log('\n========================================================');
  console.log('SUPABASE LIVE DATABASE ROW COUNT VERIFICATION');
  console.log('========================================================\n');

  const { data: liveRows, error: verifyError } = await supabase
    .from('mcqs')
    .select('topic, count')
    .eq('subject', 'Mathematics')
    .eq('class_number', 11);

  if (verifyError) {
    console.error('Failed to query live counts from Supabase:', verifyError.message);
  } else {
    // Group counts per chapter topic
    const { data: allMathRows } = await supabase
      .from('mcqs')
      .select('topic')
      .eq('subject', 'Mathematics');

    const countsByTopic: Record<string, number> = {};
    if (allMathRows) {
      for (const row of allMathRows) {
        countsByTopic[row.topic] = (countsByTopic[row.topic] || 0) + 1;
      }
    }

    console.log('CHAPTER-BY-CHAPTER BREAKDOWN IN LIVE SUPABASE DATABASE:');
    console.log('--------------------------------------------------------');
    let totalLive = 0;
    chapters.forEach((ch, i) => {
      const count = countsByTopic[ch.topic] || 0;
      totalLive += count;
      console.log(`Chapter ${String(i + 1).padStart(2, ' ')}: ${ch.topic.padEnd(45, ' ')} -> ${count} rows`);
    });
    console.log('--------------------------------------------------------');
    console.log(`TOTAL 1ST YEAR MATHEMATICS MCQS LIVE IN DATABASE: ${totalLive}`);
    console.log('========================================================\n');
  }

  console.log('SUMMARY OF CHAPTER SEEDING RESULTS:');
  console.table(chapterStatus);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
