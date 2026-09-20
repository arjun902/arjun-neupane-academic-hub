"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRows } from "@/lib/fetch-rows";
import { AuthGate } from "@/components/auth-gate";
import { supabase } from "@/lib/supabase";
import {
  categories,
  type Course,
  type Resource,
  type Unit,
  type Activity,
} from "@/lib/portal";
import type { UserProfile } from "@/lib/auth";
export function SecureStudentDashboard() {
  return (
    <AuthGate roles={["student", "admin"]}>
      {(p) => <StudentPanel profile={p} />}
    </AuthGate>
  );
}
function StudentPanel({ profile }: { profile: UserProfile }) {
  const [courses, setCourses] = useState<Course[]>([]),
    [resources, setResources] = useState<Resource[]>([]),
    [units, setUnits] = useState<Unit[]>([]),
    [activity, setActivity] = useState<Activity[]>([]),
    [announcements, setAnnouncements] = useState<
      { id: string; title: string; body: string }[]
    >([]);
  const [course, setCourse] = useState(""),
    [category, setCategory] = useState(""),
    [unit, setUnit] = useState(""),
    [type, setType] = useState(""),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("newest"),
    [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(""),
    [loading, setLoading] = useState(true),
    [preview, setPreview] = useState<{
      url: string;
      mime: string;
      title: string;
      text?: string;
    } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const clearProtected = useCallback(() => {
    setCourses([]);
    setResources([]);
    setUnits([]);
    setActivity([]);
    setAnnouncements([]);
    setPreview(null);
  }, []);
  const refresh = useCallback(async () => {
    if (!supabase) return;
    const results = await Promise.all([
      fetchRows((start, end) =>
        supabase!
          .from("hub_enrollments")
          .select("course_id")
          .eq("student_id", profile.id)
          .order("course_id")
          .range(start, end),
      ),
      fetchRows((start, end) =>
        supabase!
          .from("hub_resources")
          .select("*")
          .order("updated_at", { ascending: false })
          .order("id")
          .range(start, end),
      ),
      fetchRows((start, end) =>
        supabase!
          .from("hub_units")
          .select("*")
          .order("display_order")
          .order("id")
          .range(start, end),
      ),
      fetchRows((start, end) =>
        supabase!
          .from("hub_activity")
          .select("*")
          .eq("student_id", profile.id)
          .order("resource_id")
          .range(start, end),
      ),
      fetchRows((start, end) =>
        supabase!
          .from("hub_announcements")
          .select("id,title,body")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .order("id")
          .range(start, end),
      ),
    ]).catch(() => null);
    if (!results || results.some((r) => r.error)) {
      clearProtected();
      setStatus(
        "Resources could not be loaded. Your access may have changed. Refresh or contact your instructor.",
      );
      setLoading(false);
      return;
    }
    const ids = (results[0].data || []).map((e) => e.course_id);
    const c = await supabase.from("hub_courses").select("*").in("id", ids);
    if (c.error) {
      clearProtected();
      setStatus("Courses could not be loaded.");
      setLoading(false);
      return;
    }
    setCourses(c.data || []);
    setResources(results[1].data || []);
    setUnits(results[2].data || []);
    setActivity(results[3].data || []);
    setAnnouncements(results[4].data || []);
    setLoading(false);
  }, [profile.id, clearProtected]);
  useEffect(() => {
    try {
      setCourse(decodeURIComponent(location.hash.slice(1)));
    } catch {
      setCourse("");
    }
    void refresh();
    const timer = setInterval(() => void refresh(), 30000);
    return () => clearInterval(timer);
  }, [refresh]);
  useEffect(() => {
    if (!preview || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current.showModal();
    return () => previous?.focus();
  }, [preview]);
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  async function track(r: Resource, patch: Partial<Activity>) {
    if (!supabase) return;
    const old = activity.find((a) => a.resource_id === r.id);
    const next = {
      student_id: profile.id,
      resource_id: r.id,
      bookmarked: old?.bookmarked || false,
      completed: old?.completed || false,
      last_opened_at: old?.last_opened_at || null,
      ...patch,
    };
    const result = await supabase.from("hub_activity").upsert(next);
    if (result.error) setStatus("Could not save activity. Please retry.");
    else setActivity((a) => [...a.filter((x) => x.resource_id !== r.id), next]);
  }
  async function open(r: Resource, download = false) {
    if (!supabase || !r.file_path) return;
    setStatus("Opening resource…");
    const { data, error } = await supabase.storage
      .from("hub-materials")
      .download(r.file_path);
    if (error || !data) {
      setStatus("This file is unavailable or your access has changed.");
      return;
    }
    const url = URL.createObjectURL(data);
    if (download) {
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename || r.title;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      const text = r.mime === "text/plain" ? await data.text() : undefined;
      setPreview({ url, mime: r.mime || "", title: r.title, text });
    }
    await track(r, { last_opened_at: new Date().toISOString() });
    setStatus("");
  }
  const selected = courses.find((c) => c.id === course);
  const shown = resources
    .filter(
      (r) =>
        (!course || r.course_id === course) &&
        (!category || r.category === category) &&
        (!unit || r.unit_id === unit) &&
        (!type || r.mime === type) &&
        (!saved ||
          activity.some((a) => a.resource_id === r.id && a.bookmarked)) &&
        (r.title + " " + r.description + " " + r.tags.join(" "))
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "unit"
        ? (units.find((u) => u.id === a.unit_id)?.display_order || 0) -
            (units.find((u) => u.id === b.unit_id)?.display_order || 0) ||
          a.display_order - b.display_order
        : Date.parse(b.updated_at) - Date.parse(a.updated_at),
    );
  const last = activity
    .filter(
      (a) => a.last_opened_at && resources.some((r) => r.id === a.resource_id),
    )
    .sort(
      (a, b) => Date.parse(b.last_opened_at!) - Date.parse(a.last_opened_at!),
    )[0];
  return (
    <main id="main-content" className="site-container py-9">
      <p className="eyebrow">Your learning space</p>
      <h1 className="h2">{selected?.name || "My courses"}</h1>
      <p className="mt-2 text-muted">
        Keep your materials organised and your next step clear.
      </p>
      <div className="my-6 flex flex-wrap gap-3">
        <span className="pill">{courses.length} assigned courses</span>
        <span className="pill">{resources.length} published resources</span>
        <span className="pill">
          {activity.filter((a) => a.completed).length} resources marked complete
        </span>
      </div>
      {last && (
        <button
          className="card mb-6 w-full text-left"
          onClick={() => {
            const r = resources.find((r) => r.id === last.resource_id)!;
            setCourse(r.course_id);
            setQuery(r.title);
            setCategory("");
            setUnit("");
            setType("");
            setSaved(false);
          }}
        >
          Continue learning →{" "}
          <strong>
            {resources.find((r) => r.id === last.resource_id)?.title}
          </strong>
          <span className="block text-sm text-muted">
            Based on your last opened resource
          </span>
        </button>
      )}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <label className="grid gap-2 font-bold">
            Assigned course
            <select
              className="form-input"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setUnit("");
                location.hash = e.target.value;
              }}
            >
              <option value="">All assigned courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 font-bold">
            Resource category
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button
            className={
              "btn w-full " + (saved ? "btn-primary" : "btn-secondary")
            }
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            Bookmarks
          </button>
          <div className="rounded-lg bg-navy p-5 text-sm text-white/90">
            <strong className="text-white">A note on progress</strong>
            <p className="mt-2">
              Mark resources complete when you finish reviewing them. These
              markers record your activity, not mastery.
            </p>
          </div>
        </aside>
        <section className="min-w-0">
          {selected && (
            <div className="mb-5 rounded-lg border border-line bg-white p-5">
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <p>{selected.summary}</p>
              {selected.code && <p>Course code: {selected.code}</p>}
              {selected.semester && <p>Semester: {selected.semester}</p>}
              {selected.credits && <p>Credits: {selected.credits}</p>}
              {selected.syllabus_version && (
                <p>Syllabus: {selected.syllabus_version}</p>
              )}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1 text-sm font-bold">
              Search resources
              <input
                type="search"
                className="form-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, description, tags"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Unit
              <select
                className="form-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="">All units</option>
                {units
                  .filter((u) => !course || u.course_id === course)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">
              File type
              <select
                className="form-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All types</option>
                {Array.from(
                  new Set(resources.map((r) => r.mime).filter(Boolean)),
                ).map((m) => (
                  <option key={m} value={m!}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Sort
              <select
                className="form-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="unit">Unit order</option>
              </select>
            </label>
          </div>
          <p role="status" className="my-4 text-sm">
            {status}
          </p>
          {loading ? (
            <p aria-busy="true">Loading your resources…</p>
          ) : !shown.length ? (
            <div className="rounded-lg border border-dashed border-line bg-white p-8">
              <h2 className="text-xl font-bold">
                {courses.length
                  ? "No resources here yet"
                  : "No courses assigned yet"}
              </h2>
              <p className="mt-2 text-muted">
                {courses.length
                  ? "Try different filters, or check back when your instructor publishes materials."
                  : "Your instructor can assign courses and extend access. Contact them if you expected to see a course."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shown.map((r) => {
                const a = activity.find((x) => x.resource_id === r.id);
                return (
                  <article className="card" key={r.id}>
                    <div className="flex flex-wrap gap-2">
                      <span className="tag">{r.category}</span>
                      <span className="pill">
                        {units.find((u) => u.id === r.unit_id)?.title ||
                          "Course-wide"}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold">{r.title}</h2>
                    <p className="mt-1 whitespace-pre-wrap text-muted">
                      {r.description}
                    </p>
                    <p className="my-3 text-xs text-muted">
                      {courses.find((c) => c.id === r.course_id)?.name} ·
                      Updated {new Date(r.updated_at).toLocaleDateString()}{" "}
                      {r.size ? " · " + (r.size / 1024).toFixed(0) + " KB" : ""}{" "}
                      {r.filename ? " · " + r.filename : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {r.file_path &&
                        r.preview_enabled &&
                        [
                          "application/pdf",
                          "image/png",
                          "image/jpeg",
                          "text/plain",
                        ].includes(r.mime || "") && (
                          <button
                            className="btn btn-primary"
                            onClick={() => void open(r)}
                          >
                            Preview
                          </button>
                        )}
                      {r.file_path && r.download_enabled && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => void open(r, true)}
                        >
                          Download
                        </button>
                      )}
                      {r.external_url && (
                        <a
                          className="btn btn-secondary"
                          href={r.external_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() =>
                            void track(r, {
                              last_opened_at: new Date().toISOString(),
                            })
                          }
                        >
                          External reference ↗
                        </a>
                      )}
                      <button
                        className="btn btn-secondary"
                        aria-pressed={!!a?.bookmarked}
                        onClick={() =>
                          void track(r, { bookmarked: !a?.bookmarked })
                        }
                      >
                        {a?.bookmarked ? "Bookmarked" : "Bookmark"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        aria-pressed={!!a?.completed}
                        onClick={() =>
                          void track(r, { completed: !a?.completed })
                        }
                      >
                        {a?.completed ? "Marked complete" : "Mark complete"}
                      </button>
                    </div>
                    {r.external_url && (
                      <p className="mt-2 text-xs text-muted">
                        External content is hosted elsewhere and is not a
                        protected portal asset.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      {announcements.length > 0 && (
        <section className="mt-10">
          <h2 className="h2">Announcements</h2>
          {announcements.map((a) => (
            <article className="card mt-4" key={a.id}>
              <h3 className="font-bold">{a.title}</h3>
              <p className="whitespace-pre-wrap">{a.body}</p>
            </article>
          ))}
        </section>
      )}
      {preview && (
        <dialog
          ref={dialog}
          onCancel={(e) => {
            e.preventDefault();
            setPreview(null);
          }}
          aria-label="Resource preview"
          className="fixed inset-0 z-[60] m-0 h-screen w-screen max-h-none max-w-none overflow-auto bg-white p-4 md:p-8"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{preview.title}</h2>
            <button
              autoFocus
              className="btn btn-secondary"
              onClick={() => setPreview(null)}
            >
              Close preview
            </button>
          </div>
          {preview.text !== undefined ? (
            <>
              <button
                className="btn btn-secondary mb-3"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(preview.text!)
                    .then(() => setStatus("Code copied."))
                }
              >
                Copy text / code
              </button>
              <CodeText text={preview.text} />
            </>
          ) : preview.mime === "application/pdf" ? (
            <iframe
              title={preview.title}
              src={preview.url}
              className="h-[80vh] w-full"
            />
          ) : (
            <img
              alt={preview.title}
              src={preview.url}
              className="mx-auto max-h-[80vh]"
            />
          )}
        </dialog>
      )}
    </main>
  );
}
function CodeText({ text }: { text: string }) {
  return (
    <pre className="overflow-auto rounded-lg bg-navy p-5 text-sm text-white">
      <code>
        {text
          .split(
            /(\b(?:int|void|return|if|else|for|while|char|float|double|const|struct|include)\b)/g,
          )
          .map((t, i) => (
            <span
              key={i}
              className={
                /^(int|void|return|if|else|for|while|char|float|double|const|struct|include)$/.test(
                  t,
                )
                  ? "text-teal-300 font-bold"
                  : ""
              }
            >
              {t}
            </span>
          ))}
      </code>
    </pre>
  );
}
