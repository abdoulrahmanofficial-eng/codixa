import { ref, get, set, update } from 'firebase/database';
import { rtdb } from './firebase';

const PRICES_ROOT = 'course-prices';

export interface CoursePriceOverride {
  price: number;
  updatedAt: number;
  updatedBy: string;
}

/** Get overridden price for a course, or null if no override exists */
export async function getCoursePrice(courseId: string): Promise<number | null> {
  const snap = await get(ref(rtdb, `${PRICES_ROOT}/${courseId}`));
  if (!snap.exists()) return null;
  return snap.val().price ?? null;
}

/** Get ALL price overrides */
export async function getAllPriceOverrides(): Promise<Record<string, number>> {
  const snap = await get(ref(rtdb, PRICES_ROOT));
  if (!snap.exists()) return {};
  const data = snap.val();
  const result: Record<string, number> = {};
  for (const key of Object.keys(data)) {
    result[key] = data[key].price;
  }
  return result;
}

/** Set or update price override for a course */
export async function setCoursePrice(courseId: string, price: number, adminUid: string): Promise<void> {
  await set(ref(rtdb, `${PRICES_ROOT}/${courseId}`), {
    price,
    updatedAt: Date.now(),
    updatedBy: adminUid,
  });
}

/** Remove price override (revert to default) */
export async function removeCoursePrice(courseId: string): Promise<void> {
  await set(ref(rtdb, `${PRICES_ROOT}/${courseId}`), null);
}
