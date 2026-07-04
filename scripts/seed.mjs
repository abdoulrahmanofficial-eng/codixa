/**
 * Seed Backend Engineering Course into Firebase RTDB
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Environment variables (or .env file):
 *   ADMIN_EMAIL    — Admin Firebase Auth email
 *   ADMIN_PASSWORD — Admin password
 *
 * This script reads all Course/*.md files and uploads them
 * to Firebase RTDB under dynamic-courses/backend-engineering/
 *
 * After seeding, delete or secure this script. Lesson content is
 * ONLY in Firebase — never in the frontend bundle.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const firebaseConfig = {
  apiKey: "AIzaSyChrCv4D91a2w4h7_wzGe8hdct5bP_Aamc",
  authDomain: "codixa-io.firebaseapp.com",
  projectId: "codixa-io",
  storageBucket: "codixa-io.firebasestorage.app",
  messagingSenderId: "305339914704",
  appId: "1:305339914704:web:d1f6be0efb5d89b5c281d5",
  measurementId: "G-KWYMKYHZXQ"
};

const chapters = [
  { id: 'be-ch1', title: 'أساسيات الحاسوب والبرمجة', start: 1, end: 10 },
  { id: 'be-ch2', title: 'أساسيات بايثون', start: 11, end: 15 },
  { id: 'be-ch3', title: 'هياكل البيانات والتحكم', start: 16, end: 25 },
  { id: 'be-ch4', title: 'البرمجة الكائنية والمتقدمة', start: 26, end: 37 },
  { id: 'be-ch5', title: 'APIs وقواعد البيانات', start: 38, end: 40 },
  { id: 'be-ch6', title: 'تطوير الواجهات الخلفية والـ DevOps', start: 41, end: 44 },
  { id: 'be-ch7', title: 'المشروع النهائي', start: 45, end: 45 },
  { id: 'be-ch8', title: 'تصميم الأنظمة والحوسبة السحابية', start: 46, end: 48 },
];

function getChapterForFile(num) {
  for (const ch of chapters) {
    if (num >= ch.start && num <= ch.end) return ch;
  }
  return chapters[0];
}

function getCleanTitle(firstLine, num) {
  let t = firstLine.replace(/^#\s*/, '').trim();
  t = t.replace(/\.md$/i, '').trim();
  t = t.replace(/^\d+\s*[-_]\s*/, '').trim();
  t = t.replace(/[-]+/g, ' ');
  return t;
}

/**
 * Parse quiz questions from markdown content under the # Quiz section.
 * Handles both format variants:
 *   - Format B (files 2-44): A) text (letter + paren, blank lines between options)
 *   - Format A (file 1): - A) text (dash prefix, compact)
 *   - Code block options: A)\n```...```
 * Returns array of { question, options, correct, explanation } or empty array.
 */
function parseQuiz(content) {
  const quizMatch = content.match(/# Quiz\s*\n([\s\S]*?)$/);
  if (!quizMatch) return [];

  const quizSection = quizMatch[1];
  const blocks = quizSection.split(/^##\s+السؤال\s+/m).slice(1);
  if (blocks.length === 0) return [];

  const questions = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');

    // Find the answer line
    const answerIdx = lines.findIndex(l => l.includes('✅'));
    if (answerIdx === -1) continue;

    const answerLine = lines[answerIdx];
    const answerText = answerLine.replace(/.*✅\s*(?:الإجابة|الإجابة)\s*:\s*/, '').replace(/[.۔\s]+$/, '').trim();

    // Everything before answer line is question + options
    const beforeAnswer = lines.slice(0, answerIdx).join('\n').trim();

    // Extract option lines
    const optionLines = [];
    for (const line of lines.slice(0, answerIdx)) {
      const trimmed = line.trim();
      // Match option patterns: "A) text", "- A) text", "A)\n```" (starts with letter then ))
      if (/^[-]?\s*[A-D]\)/.test(trimmed) || /^[-]?\s*[A-D]\)\s*$/.test(trimmed)) {
        optionLines.push(trimmed.replace(/^-\s*/, '').trim());
      }
    }

    // If no A-D) pattern found, try detecting unlabeled options (file_1 Q3/Q4 style)
    let options;
    let correctIdx = -1;
    let questionText;

    if (optionLines.length > 0) {
      options = optionLines.map(o => {
        // Strip the "A)" or "A)" prefix
        const letter = o[0];
        const rest = o.replace(/^[A-D]\)\s*/, '').trim();
        return rest;
      });

      // Try to match answer as a letter
      if (/^[A-D]$/.test(answerText)) {
        correctIdx = answerText.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      } else {
        // Match by text
        correctIdx = options.findIndex(opt => {
          const cleanOpt = opt.replace(/[.۔\s]+$/, '').trim();
          const cleanAns = answerText.replace(/[.۔\s]+$/, '').trim();
          return cleanOpt === cleanAns;
        });
      }

      // Extract question text: everything before the first option line
      questionText = beforeAnswer;
      for (const line of lines.slice(0, answerIdx)) {
        const trimmed = line.trim();
        if (/^[-]?\s*[A-D]\)/.test(trimmed) || /^[-]?\s*[A-D]\)\s*$/.test(trimmed) || /^-\s*.+/.test(trimmed)) {
          questionText = questionText.replace(trimmed, '').trim();
        }
      }
      questionText = questionText.replace(/^-\s*/, '').trim();
    } else {
      // Unlabeled options (file_1 Q3/Q4 style): lines that are just text, no A-B pattern
      // Extract question text (lines before the first `- ` prefixed line)
      const firstOptionIdx = lines.slice(0, answerIdx).findIndex(l => /^-\s*/.test(l.trim()));
      questionText = firstOptionIdx >= 0
        ? lines.slice(0, firstOptionIdx).join('\n').trim()
        : beforeAnswer;

      // Options are the lines starting with `- `
      options = lines.slice(0, answerIdx)
        .filter(l => /^-\s*/.test(l.trim()))
        .map(l => l.trim().replace(/^-\s*/, ''))
        .filter(l => l);

      if (options.length >= 2) {
        correctIdx = options.findIndex(opt => {
          const cleanOpt = opt.replace(/[.۔\s]+$/, '').trim();
          const cleanAns = answerText.replace(/[.۔\s]+$/, '').trim();
          return cleanOpt === cleanAns;
        });
      }
    }

    if (!options || correctIdx === -1) continue;

    questions.push({
      question: questionText,
      options,
      correct: correctIdx,
      explanation: `الإجابة الصحيحة: ${options[correctIdx]}`,
    });
  }

  return questions;
}

/**
 * Strip the # Quiz section from content so it doesn't render as plain text.
 * The quiz is already stored as structured data in the `quiz` field.
 */
function stripQuizSection(content) {
  return content.replace(/\n*# Quiz[\s\S]*?(?=\n# |$)/, '');
}

const COURSE_ID = 'backend-engineering';

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in .env file');
    console.error('   Or run: ADMIN_EMAIL=xxx ADMIN_PASSWORD=xxx node scripts/seed.mjs');
    process.exit(1);
  }

  // Init Firebase
  const app = initializeApp(firebaseConfig, 'seed');
  const auth = getAuth(app);
  const db = getDatabase(app);

  // Authenticate
  console.log('🔐 Signing in as', email);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log('✅ Signed in as', cred.user.email);

  // Check if already seeded
  const courseRef = ref(db, `dynamic-courses/${COURSE_ID}`);
  const existing = await get(courseRef);
  if (existing.exists()) {
    console.log('⚠️  Course already exists. Use force flag to re-seed.');
    const answer = process.argv.includes('--force') ? 'y' : 'n';
    if (answer !== 'y') {
      console.log('   Skipping. Run with --force to override.');
      process.exit(0);
    }
  }

  // Read course files
  const courseDir = path.join(ROOT, 'Course');
  const files = fs.readdirSync(courseDir)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || '0');
      const nb = parseInt(b.match(/\d+/)?.[0] || '0');
      return na - nb;
    });

  console.log(`📖 Reading ${files.length} lesson files...`);

  const lessons = {};
  for (const f of files) {
    const num = parseInt(f.match(/\d+/)?.[0] || '0');
    const content = fs.readFileSync(path.join(courseDir, f), 'utf-8');
    const firstLine = content.split('\n')[0];
    const title = getCleanTitle(firstLine, num);
    const ch = getChapterForFile(num);
    const durationMatch = content.match(/>\s*مدة\s*(?:القراءة|التنفيذ)[^:]*:\s*([^\n]+)/);
    const duration = durationMatch ? durationMatch[1].trim() : '30 دقيقة';

    // Parse quiz questions from the content
    const quiz = parseQuiz(content);

    // Strip quiz section from content — it's now stored as structured data
    const cleanContent = stripQuizSection(content);

    const lessonId = `be-l${num}`;
    const lessonData = {
      id: lessonId,
      title,
      content: cleanContent,
      duration,
      order_index: num,
      chapterId: ch.id,
      chapterTitle: ch.title,
    };
    if (quiz.length > 0) {
      lessonData.quiz = quiz;
    }
    lessons[lessonId] = lessonData;
  }

  // Build course object
  const courseData = {
    title: 'Production Backend Engineering Track',
    description: 'مسار متكامل لتعلم تطوير الواجهات الخلفية من الصفر إلى الاحتراف. يغطي أساسيات البرمجة، بايثون، APIs، قواعد البيانات، FastAPI، الأمان، DevOps، Docker، تصميم الأنظمة، السحابة، و Kubernetes.',
    price: 0,
    level: 'مبتدئ إلى محترف',
    icon: '⚙️',
    bgGradient: 'from-slate-700 to-slate-900',
    language: 'Python',
    skills: [
      'Python','APIs','Databases','FastAPI','Authentication',
      'DevOps','Docker','System Design','Cloud (AWS)','Kubernetes',
      'Microservices','CI/CD','OOP','Algorithms','Data Structures'
    ],
    lessonsCount: 48,
    chapters: chapters.reduce((acc, ch) => {
      acc[ch.id] = { id: ch.id, title: ch.title };
      return acc;
    }, {}),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    free: true,
  };

  // Upload to Firebase
  console.log('⏫ Uploading course metadata...');
  await set(courseRef, courseData);
  console.log('✅ Course metadata uploaded.');

  console.log('⏫ Uploading 48 lessons...');
  await set(ref(db, `dynamic-courses/${COURSE_ID}/lessons`), lessons);
  console.log('✅ All lessons uploaded.');

  console.log('');
  const quizCount = Object.values(lessons).filter(l => l.quiz).length;
  console.log(`🎉 Seeding complete!`);
  console.log(`   Course:  ${COURSE_ID}`);
  console.log(`   Lessons: ${files.length}`);
  console.log(`   Lessons with quizzes: ${quizCount}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Delete this script or secure it after use.');
  console.log('   Lesson content is now ONLY in Firebase RTDB.');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
