import { PREBUILT_QUESTIONS } from './src/data/prebuiltQuestions';

const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English', 'Urdu', 'Islamiat'];
subjects.forEach(sub => {
  const pool = PREBUILT_QUESTIONS[sub] || PREBUILT_QUESTIONS[sub === 'Islamiat' ? 'Islamic Studies' : sub];
  if (!pool) {
    console.log(`No pool for ${sub}`);
    return;
  }
  console.log(`\n=== TEST COMBINATION: ${sub} (Class 9-12) ===`);
  console.log(`Available Questions: ${pool.length}`);
  
  // Sample 2 random questions for verification
  const samples = [...pool].sort(() => 0.5 - Math.random()).slice(0, 2);
  samples.forEach((q, i) => {
    console.log(`Q${i+1}: ${q.q}`);
    console.log(`Options: ${q.options.map((o, idx) => (idx === q.correct ? '*' + o + '*' : o)).join(' | ')}`);
    console.log(`Explanation: ${q.explain}`);
  });
});
