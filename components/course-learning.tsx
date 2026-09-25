"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Eye,
  EyeOff,
  LockKeyhole,
  Download,
  Bookmark,
  Check,
  X,
} from "lucide-react";
import { categories, phaseCourses } from "@/lib/portal";
import {
  CourseAccessError,
  clearCourseSession,
  courseClientId,
  courseRequest,
  getCourseSession,
  isCourseSessionStorageEvent,
  lockAllCourses,
  lockCourse,
  saveCourseSession,
  type CourseContent,
} from "@/lib/course-access";
type Progress = Record<string, { bookmarked?: boolean; completed?: boolean }>;
type Preview = { title: string; url?: string; text?: string; mime: string };
export function CourseLearning({ courseId }: { courseId: string }) {
  const summary = phaseCourses.find((c) => c.id === courseId)!;
  const [content, setContent] = useState<CourseContent | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  const [show, setShow] = useState(false),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [unit, setUnit] = useState(""),
    [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [progress, setProgress] = useState<Progress>({}),
    [preview, setPreview] = useState<Preview | null>(null),
    [lockPending, setLockPending] = useState<"one" | "all" | null>(null);
  const generation = useRef(0),
    passwordInput = useRef<HTMLInputElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const progressKey = `academic-course-progress-v1:${courseId}`;
  const closeProtected = useCallback(() => {
    generation.current++;
    setContent(null);
    setPreview(null);
  }, []);
  const load = useCallback(async () => {
    const session = getCourseSession(courseId),
      version = ++generation.current;
    if (!session) {
      setContent(null);
      setPreview(null);
      setLoading(false);
      return;
    }
    try {
      const data = await courseRequest<CourseContent>(
        courseId,
        { action: "content" },
        session.token,
      );
      if (version === generation.current) {
        setContent(data);
        setStatus("");
      }
    } catch (e) {
      if (version !== generation.current) return;
      setContent(null);
      setPreview(null);
      if (e instanceof CourseAccessError && e.code === "session_invalid")
        clearCourseSession(courseId);
      setStatus((e as Error).message);
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, [courseId]);
  useEffect(() => {
    void load();
    try {
      setProgress(JSON.parse(localStorage.getItem(progressKey) || "{}"));
    } catch {}
    return () => {
      generation.current++;
    };
  }, [load, progressKey]);
  useEffect(() => {
    if (lockPending) return;
    const timer = window.setInterval(() => void load(), 30000);
    const visible = () => {
      if (document.visibilityState === "visible") void load();
    };
    const storage = (e: StorageEvent) => {
      if (isCourseSessionStorageEvent(e)) {
        closeProtected();
        if (e.key === "academic-course-lock-all") clearCourseSession(courseId);
        void load();
      }
    };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("storage", storage);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("storage", storage);
    };
  }, [load, lockPending, closeProtected, courseId]);
  useEffect(() => {
    if (!content) return;
    const timer = window.setTimeout(
      () => {
        closeProtected();
        clearCourseSession(courseId);
        setStatus(
          "Your course session has expired. Enter the current course password to continue.",
        );
      },
      Math.max(0, Date.parse(content.expires_at) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [content, courseId, closeProtected]);
  useEffect(() => {
    if (preview) dialog.current?.showModal();
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);
  async function unlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    setBusy(true);
    setStatus("");
    const password = String(f.get("password") || "");
    const remember = f.has("remember");
    form.reset();
    setShow(false);
    try {
      const session = await courseRequest<{
        token: string;
        expires_at: string;
      }>(courseId, {
        action: "unlock",
        password,
        remember,
        client_id: courseClientId(),
      });
      try {
        saveCourseSession(courseId, session, remember);
      } catch (e) {
        await courseRequest(courseId, { action: "lock" }, session.token).catch(
          () => {},
        );
        throw e;
      }
      await load();
    } catch (e) {
      setStatus((e as Error).message);
      passwordInput.current?.focus();
    } finally {
      setBusy(false);
    }
  }
  async function lock(scope: "one" | "all") {
    closeProtected();
    setLockPending(scope);
    setBusy(true);
    setStatus("");
    try {
      if (scope === "all") await lockAllCourses();
      else await lockCourse(courseId);
      setLockPending(null);
      setStatus(
        scope === "all"
          ? "All courses on this device are locked."
          : "This course is locked.",
      );
    } catch (e) {
      setStatus(
        (e as Error).message +
          " Your learning view is closed. Retry to finish revoking access.",
      );
    } finally {
      setBusy(false);
    }
  }
  function track(id: string, field: "bookmarked" | "completed") {
    const next = {
      ...progress,
      [id]: { ...progress[id], [field]: !progress[id]?.[field] },
    };
    try {
      localStorage.setItem(progressKey, JSON.stringify(next));
      setProgress(next);
    } catch {
      setStatus(
        "Browser progress could not be saved. Allow site storage to use bookmarks.",
      );
    }
  }
  async function open(
    resource: CourseContent["resources"][number],
    download: boolean,
  ) {
    const session = getCourseSession(courseId);
    if (!session) {
      closeProtected();
      setStatus("Your session expired. Unlock this course again.");
      return;
    }
    const version = generation.current;
    setBusy(true);
    setStatus("");
    try {
      const result = await courseRequest<{
        url: string;
        external?: boolean;
        mime?: string;
      }>(
        courseId,
        { action: "file", resource_id: resource.id, download },
        session.token,
      );
      if (version !== generation.current) return;
      if (result.external) {
        // Explicitly render the authorized reference; no course token is sent.
        setPreview({
          title: resource.title,
          text: result.url,
          mime: "external",
        });
        return;
      }
      const response = await fetch(result.url, {
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok)
        throw Error(
          "The file link expired or the file is unavailable. Try opening it again.",
        );
      const blob = await response.blob();
      if (version !== generation.current) return;
      if (download) {
        const url = URL.createObjectURL(blob),
          anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = resource.filename || "course-material";
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else if (resource.mime === "text/plain") {
        const text = await blob.text();
        if (version === generation.current)
          setPreview({ title: resource.title, text, mime: "text/plain" });
      } else
        setPreview({
          title: resource.title,
          url: URL.createObjectURL(
            new Blob([blob], {
              type: resource.mime || "application/octet-stream",
            }),
          ),
          mime: resource.mime || "",
        });
    } catch (e) {
      if (e instanceof CourseAccessError && e.code === "session_invalid") {
        closeProtected();
        clearCourseSession(courseId);
      }
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const shown =
    content?.resources.filter(
      (r) =>
        (!category || r.category === category) &&
        (!unit || r.unit_id === unit) &&
        (!bookmarksOnly || progress[r.id]?.bookmarked) &&
        (r.title + " " + r.description + " " + r.tags.join(" "))
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) || [];
  return (
    <main id="main-content" className="site-container py-9 md:py-12">
      <Link href="/courses" className="text-sm font-bold text-teal-deep">
        ← All courses
      </Link>
      {loading ? (
        <p className="py-12" aria-busy="true">
          Checking course access…
        </p>
      ) : !content ? (
        <section className="mx-auto my-10 grid max-w-4xl gap-8 lg:grid-cols-2">
          <div>
            <span className="icon-box">
              <BookOpen size={24} />
            </span>
            <p className="eyebrow">{summary.program}</p>
            <h1 className="h2">{summary.name}</h1>
            <p className="mt-4 text-muted">{summary.summary}</p>
            <p className="mt-6 font-semibold">
              Your class. Your course materials.
            </p>
            <p className="mt-2 text-sm text-muted">
              Enter the course password provided by your instructor. No student
              account or email is needed.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-2xl font-bold text-navy">Unlock Course</h2>
            {lockPending ? (
              <>
                <p className="my-4" role="alert">
                  {status || "Locking course access…"}
                </p>
                <button
                  disabled={busy}
                  className="btn btn-primary"
                  onClick={() => void lock(lockPending)}
                >
                  Retry locking{" "}
                  {lockPending === "all" ? "all courses" : "this course"}
                </button>
              </>
            ) : (
              <form onSubmit={unlock} className="mt-6 grid gap-4">
                <p className="text-sm text-muted">
                  Just your course password. No email or verification needed.
                </p>
                <label htmlFor="course-password" className="text-sm font-bold">
                  Course password
                </label>
                <div className="flex gap-2">
                  <input
                    ref={passwordInput}
                    id="course-password"
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    className="form-input"
                    required
                    maxLength={72}
                    aria-describedby="course-help unlock-status"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary shrink-0"
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    className="mt-1 h-4 w-4"
                    name="remember"
                    type="checkbox"
                  />
                  Remember this course on this device
                </label>
                <p id="course-help" className="text-xs text-muted">
                  Leave this unchecked on shared devices. Access lasts up to 8
                  hours, or up to 7 days when remembered, subject to your
                  instructor’s settings.
                </p>
                <button disabled={busy} className="btn btn-primary">
                  <LockKeyhole size={17} />
                  {busy ? "Unlocking…" : "Unlock Course"}
                </button>
                <p
                  id="unlock-status"
                  role="status"
                  aria-live="polite"
                  className="text-sm font-semibold"
                >
                  {status}
                </p>
                <p className="text-sm">
                  Need the password?{" "}
                  <Link
                    className="font-bold text-teal-deep underline"
                    href="/contact"
                  >
                    Contact your instructor.
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      ) : (
        <>
          <header className="mt-7 flex flex-wrap items-start justify-between gap-5 border-b border-line pb-7">
            <div>
              <p className="eyebrow">{content.course.program}</p>
              <h1 className="h2">{content.course.name}</h1>
              <p className="mt-3 max-w-2xl text-muted">
                {content.course.summary}
              </p>
              <p className="mt-3 text-xs text-muted">
                Access until {new Date(content.expires_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void lock("one")}
              >
                Lock this course
              </button>
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void lock("all")}
              >
                Lock all courses on this device
              </button>
            </div>
          </header>
          {content.announcements.map((a) => (
            <article
              key={a.id}
              className="mt-5 rounded-lg border-l-4 border-teal bg-white p-5"
            >
              <h2 className="font-bold">{a.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm">{a.body}</p>
            </article>
          ))}
          <section className="mt-7" aria-label="Learning materials">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-bold">Learning materials</h2>
              <span className="pill">
                {content.resources.length} published resources
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Bookmarks and completion are saved on this browser. They are
              personal reminders, not verified student records or cross-device
              progress.
            </p>
            <div className="my-5 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="grid gap-1 text-sm font-bold">
                Search this unlocked course
                <input
                  className="form-input"
                  type="search"
                  placeholder="Title, topic or tag"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Collection
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All collections</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Unit
                <select
                  className="form-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">All units</option>
                  {content.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bookmarksOnly}
                  onChange={(e) => setBookmarksOnly(e.target.checked)}
                />
                Bookmarked on this browser
              </label>
            </div>
            <p role="status" className="my-3 text-sm">
              {status}
            </p>
            {!shown.length ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8">
                <h3 className="font-bold">
                  {content.resources.length
                    ? "No matching materials"
                    : "No materials published yet"}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {content.resources.length
                    ? "Try another search or collection."
                    : "Your instructor will add the syllabus, notes and practical work here when they are ready."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {shown.map((r) => (
                  <article key={r.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="tag">{r.category}</span>
                        <h3 className="mt-3 break-words text-xl font-bold">
                          {r.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">
                          {r.description}
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          {content.units.find((u) => u.id === r.unit_id)
                            ?.title || "Course-wide"}{" "}
                          · Updated {r.updated_at.slice(0, 10)}
                          {r.filename ? ` · ${r.filename}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {r.preview_enabled && (
                          <button
                            disabled={busy}
                            className="btn btn-primary"
                            onClick={() => void open(r, false)}
                          >
                            <Eye size={17} />
                            Open
                          </button>
                        )}
                        {r.download_enabled && (
                          <button
                            disabled={busy}
                            className="btn btn-secondary"
                            onClick={() => void open(r, true)}
                          >
                            <Download size={17} />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                      <button
                        className="btn btn-ghost"
                        aria-pressed={!!progress[r.id]?.bookmarked}
                        onClick={() => track(r.id, "bookmarked")}
                      >
                        <Bookmark size={16} />
                        {progress[r.id]?.bookmarked ? "Bookmarked" : "Bookmark"}
                      </button>
                      <button
                        className="btn btn-ghost"
                        aria-pressed={!!progress[r.id]?.completed}
                        onClick={() => track(r.id, "completed")}
                      >
                        <Check size={16} />
                        {progress[r.id]?.completed
                          ? "Completed on this browser"
                          : "Mark complete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      {preview && (
        <dialog
          ref={dialog}
          onClose={() => setPreview(null)}
          className="w-[min(1100px,95vw)] max-w-none rounded-lg p-0 backdrop:bg-navy/70"
        >
          <div className="flex items-center justify-between gap-4 border-b border-line p-4">
            <h2 className="font-bold">{preview.title}</h2>
            <button
              autoFocus
              className="btn btn-secondary"
              onClick={() => dialog.current?.close()}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
          {preview.mime === "external" ? (
            <div className="p-6">
              <p>This reference opens an external website.</p>
              <a
                className="btn btn-primary mt-4"
                href={preview.text}
                target="_blank"
                rel="noreferrer"
              >
                Open reference ↗
              </a>
            </div>
          ) : preview.text !== undefined ? (
            <pre className="max-h-[70vh] overflow-auto p-5 text-sm">
              <code>{preview.text}</code>
            </pre>
          ) : preview.mime === "application/pdf" ? (
            <iframe
              title={preview.title}
              src={preview.url}
              className="h-[70vh] w-full"
              sandbox="allow-same-origin"
            />
          ) : preview.mime.startsWith("image/") ? (
            <img
              src={preview.url}
              alt={preview.title}
              className="mx-auto max-h-[70vh] max-w-full"
            />
          ) : (
            <p className="p-6">
              Preview is unavailable for this file type. Close this preview and
              use Download if enabled.
            </p>
          )}
        </dialog>
      )}
    </main>
  );
}
