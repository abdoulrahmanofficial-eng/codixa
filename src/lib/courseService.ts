import { ref, get, set, update } from 'firebase/database';
import { rtdb } from './firebase';
import type { QuizQuestion } from './types';
export type { QuizQuestion };

export interface BackendLesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
  duration: string;
  chapterId: string;
  chapterTitle: string;
  quiz?: QuizQuestion[];
}

export interface BackendCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  icon: string;
  bgGradient: string;
  language: string;
  skills: string[];
  lessonsCount: number;
  chapters: { id: string; title: string }[];
  createdAt: number;
  updatedAt: number;
  free: boolean;
}

const COURSES_ROOT = 'dynamic-courses';

function rtdbToArray<T>(data: Record<string, any> | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.keys(data).map(k => ({ ...data[k], id: k } as unknown as T));
}

/** Check if a user has purchased or can access a course */
function canAccessCourse(courseId: string, purchasedCourses: string[], isFree: boolean): boolean {
  return isFree || purchasedCourses.includes(courseId);
}

function extractSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return Object.keys(skills).map(k => skills[k]).filter(Boolean);
}

/** Get course metadata only (no lesson content) - public */
export async function getDynamicCourses(): Promise<BackendCourse[]> {
  const snap = await get(ref(rtdb, COURSES_ROOT));
  if (!snap.exists()) return [];
  const data = snap.val();
  return Object.keys(data).map(k => {
    const c = data[k];
    return {
      ...c,
      id: k,
      chapters: c.chapters ? rtdbToArray(c.chapters) : [],
      skills: extractSkills(c.skills),
    } as BackendCourse;
  });
}

/** Get single course metadata - public */
export async function getDynamicCourse(courseId: string): Promise<BackendCourse | null> {
  const snap = await get(ref(rtdb, `${COURSES_ROOT}/${courseId}`));
  if (!snap.exists()) return null;
  const data = snap.val();
  return {
    ...data,
    id: courseId,
    chapters: data.chapters ? rtdbToArray(data.chapters) : [],
    skills: extractSkills(data.skills),
  } as BackendCourse;
}

/**
 * Get lessons metadata (titles, order) WITHOUT content.
 * Public — no auth needed for metadata.
 */
export async function getLessonMeta(courseId: string): Promise<BackendLesson[]> {
  const snap = await get(ref(rtdb, `${COURSES_ROOT}/${courseId}/lessons`));
  if (!snap.exists()) return [];
  const data = snap.val();
  return rtdbToArray<BackendLesson>(data)
    .sort((a, b) => a.order_index - b.order_index)
    .map(l => ({ ...l, content: '' }));
}

/**
 * Get a single lesson with FULL content.
 * REQUIRES the user to have purchased the course (or it's free).
 * Returns null if access is denied.
 */
export async function getLessonContent(
  courseId: string,
  lessonId: string,
  purchasedCourses: string[],
  isFree: boolean,
): Promise<BackendLesson | null> {
  if (!canAccessCourse(courseId, purchasedCourses, isFree)) return null;
  const snap = await get(ref(rtdb, `${COURSES_ROOT}/${courseId}/lessons/${lessonId}`));
  if (!snap.exists()) return null;
  return { ...snap.val(), id: lessonId } as BackendLesson;
}

/**
 * Get all lessons with FULL content.
 * REQUIRES the user to have purchased the course (or it's free).
 * Returns empty array if access is denied.
 */
export async function getLessonsWithContent(
  courseId: string,
  purchasedCourses: string[],
  isFree: boolean,
): Promise<BackendLesson[]> {
  if (!canAccessCourse(courseId, purchasedCourses, isFree)) return [];
  const snap = await get(ref(rtdb, `${COURSES_ROOT}/${courseId}/lessons`));
  if (!snap.exists()) return [];
  const data = snap.val();
  return rtdbToArray<BackendLesson>(data).sort((a, b) => a.order_index - b.order_index);
}

/**
 * Seed course data from browser (admin only).
 * @param courseId - the course ID
 * @param lessons - array of lessons with full content
 * @param courseMeta - course metadata
 */
export async function seedCourse(
  courseId: string,
  lessons: BackendLesson[],
  courseMeta: {
    title: string;
    description: string;
    price: number;
    level: string;
    icon: string;
    bgGradient: string;
    language: string;
    skills: string[];
    lessonsCount: number;
    chapters: { id: string; title: string }[];
    free: boolean;
  }
): Promise<void> {
  const courseRef = ref(rtdb, `${COURSES_ROOT}/${courseId}`);

  const chaptersRecord: Record<string, any> = {};
  courseMeta.chapters.forEach(ch => { chaptersRecord[ch.id] = ch; });
  const skillsRecord: Record<string, string> = {};
  courseMeta.skills.forEach((s, i) => { skillsRecord[String(i)] = s; });

  const lessonsRecord: Record<string, any> = {};
  lessons.forEach(l => {
    lessonsRecord[l.id] = {
      title: l.title,
      content: l.content,
      duration: l.duration,
      order_index: l.order_index,
      chapterId: l.chapterId,
      chapterTitle: l.chapterTitle,
    };
  });

  await set(courseRef, {
    title: courseMeta.title,
    description: courseMeta.description,
    price: courseMeta.price,
    level: courseMeta.level,
    icon: courseMeta.icon,
    bgGradient: courseMeta.bgGradient,
    language: courseMeta.language,
    skills: skillsRecord,
    lessonsCount: courseMeta.lessonsCount,
    chapters: chaptersRecord,
    free: courseMeta.free,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lessons: lessonsRecord,
  });
}

export async function updateCoursePrice(courseId: string, price: number): Promise<void> {
  await update(ref(rtdb, `${COURSES_ROOT}/${courseId}`), {
    price,
    updatedAt: Date.now(),
  });
}

export async function updateCourse(courseId: string, data: Partial<BackendCourse>): Promise<void> {
  await update(ref(rtdb, `${COURSES_ROOT}/${courseId}`), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function seedCourseExists(courseId: string): Promise<boolean> {
  const snap = await get(ref(rtdb, `${COURSES_ROOT}/${courseId}`));
  return snap.exists();
}
