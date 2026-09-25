import {
  phaseCourses,
  type Course,
  type Resource,
  type Unit,
} from "@/lib/portal";

export type CourseContent = {
  course: Course;
  units: Unit[];
  resources: Omit<Resource, "file_path" | "external_url">[];
  announcements: { id: string; title: string; body: string }[];
  expires_at: string;
};
type Session = { token: string; expires_at: string };
const prefix = "academic-course-session-v1:";
export class CourseAccessError extends Error {
  constructor(
    message: string,
    public code = "",
    public status = 0,
  ) {
    super(message);
  }
}
export async function courseRequest<T>(
  courseId: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new CourseAccessError(
      "Course access is not configured yet. Please contact your instructor.",
    );
  let response: Response;
  try {
    response = await fetch(`${url}/functions/v1/course-access`, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        ...(token ? { "x-course-session": token } : {}),
      },
      body: JSON.stringify({ ...body, course_id: courseId }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new CourseAccessError(
      "Could not connect. Check your connection and try again.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new CourseAccessError(
      data?.error || "Course access is temporarily unavailable.",
      data?.code || "",
      response.status,
    );
  return data as T;
}
export function getCourseSession(courseId: string): Session | null {
  try {
    const raw =
      sessionStorage.getItem(prefix + courseId) ||
      localStorage.getItem(prefix + courseId);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (
      typeof value.token !== "string" ||
      !Number.isFinite(Date.parse(value.expires_at)) ||
      Date.parse(value.expires_at) <= Date.now()
    ) {
      clearCourseSession(courseId);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}
export function clearCourseSession(courseId: string) {
  try {
    sessionStorage.removeItem(prefix + courseId);
    localStorage.removeItem(prefix + courseId);
  } catch {}
  window.dispatchEvent(new Event("course-session-change"));
}
export function isCourseSessionStorageEvent(e: StorageEvent) {
  return e.key?.startsWith(prefix) || e.key === "academic-course-lock-all";
}
export function saveCourseSession(
  courseId: string,
  session: Session,
  remember: boolean,
) {
  // Only an opaque bearer token, never passwords, hashes, metadata or files.
  clearCourseSession(courseId);
  try {
    (remember ? localStorage : sessionStorage).setItem(
      prefix + courseId,
      JSON.stringify(session),
    );
  } catch {
    throw new CourseAccessError(
      "Browser storage is unavailable. Allow site storage and try again.",
    );
  }
  window.dispatchEvent(new Event("course-session-change"));
}
export function courseClientId() {
  const key = "academic-course-device-v1";
  try {
    let id = localStorage.getItem(key);
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    throw new CourseAccessError("Allow browser storage to unlock this course.");
  }
}
export async function lockCourse(courseId: string) {
  const session = getCourseSession(courseId);
  // Retain the token until server revocation succeeds so an offline retry is
  // possible. The UI immediately closes its protected view during this call.
  if (session) await courseRequest(courseId, { action: "lock" }, session.token);
  clearCourseSession(courseId);
}
export async function lockAllCourses() {
  const sessions = phaseCourses
    .map((c) => ({ id: c.id, session: getCourseSession(c.id) }))
    .filter((c) => c.session);
  // One authenticated session revokes all sessions sharing this browser's
  // random device ID, including standard sessions held in other tabs.
  const results = await Promise.allSettled(
    sessions.map((s) =>
      courseRequest(s.id, { action: "lock-all" }, s.session!.token),
    ),
  );
  if (results.some((r) => r.status === "rejected"))
    throw new CourseAccessError(
      "Some sessions could not be revoked. Reconnect and retry Lock all courses.",
    );
  phaseCourses.forEach((c) => clearCourseSession(c.id));
  try {
    localStorage.setItem("academic-course-lock-all", crypto.randomUUID());
  } catch {}
}
