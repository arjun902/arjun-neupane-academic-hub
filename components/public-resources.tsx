"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Download, FileText } from "lucide-react";
import { publicSupabase as db } from "@/lib/public-supabase";
import { fetchRows } from "@/lib/fetch-rows";
import {
  phaseCourses,
  categories,
  type Resource,
  type Unit,
} from "@/lib/portal";

type CourseSummary = {
  id: string;
  name: string;
  program: string;
  summary: string;
};
export function PublicResources({ courseId = "" }: { courseId?: string }) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseSummary[]>(phaseCourses);
  const [course, setCourse] = useState(courseId);
  const [resources, setResources] = useState<Resource[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [opening, setOpening] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    title: string;
    mime: string;
    text?: string;
  } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const version = ++generation.current;
    setLoading(true);
    setError("");
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      const result = await Promise.all([
        fetchRows((start, end) =>
          db!
            .from("hub_courses")
            .select("id,name,program,summary")
            .eq("visible", true)
            .order("display_order")
            .order("id")
            .range(start, end),
        ),
        fetchRows((start, end) =>
          db!
            .from("hub_units")
            .select("*")
            .order("display_order")
            .order("id")
            .range(start, end),
        ),
        fetchRows((start, end) =>
          db!
            .from("hub_resources")
            .select("*")
            .eq("status", "published")
            .or(`release_at.is.null,release_at.lte.${new Date().toISOString()}`)
            .order("display_order")
            .order("id")
            .range(start, end),
        ),
      ]);
      if (version !== generation.current) return;
      if (result.some((r) => r.error)) throw new Error("unavailable");
      const visible = result[0].data || [];
      setCourses(visible);
      setUnits(
        (result[1].data || []).filter((u) =>
          visible.some((c) => c.id === u.course_id),
        ),
      );
      setResources(
        (result[2].data || []).filter((r) =>
          visible.some((c) => c.id === r.course_id),
        ),
      );
    } catch {
      if (version === generation.current) {
        setResources([]);
        setUnits([]);
        setError(
          "Learning materials could not be loaded. Please retry or contact the instructor.",
        );
      }
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    return () => {
      generation.current += 1;
    };
  }, [reload]);
  useEffect(() => {
    if (courseId) {
      setCourse(courseId);
      return;
    }
    const readHash = () => {
      try {
        setCourse(decodeURIComponent(location.hash.slice(1)));
        setUnit("");
      } catch {
        setCourse("");
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [courseId]);
  useEffect(() => {
    if (!preview || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current.showModal();
    return () => {
      URL.revokeObjectURL(preview.url);
      previous?.focus();
    };
  }, [preview]);
  async function open(r: Resource, download = false) {
    if (!db || !r.file_path || opening) return;
    setOpening(r.id);
    setStatus("Opening resource…");
    try {
      const { data, error } = await db.storage
        .from("hub-materials")
        .download(r.file_path);
      if (error || !data) throw new Error("file unavailable");
      // Do not embed untrusted HTML or SVG. Only approved preview types are rendered.
      const blob = new Blob([data], {
        type: r.mime || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement("a");
        a.href = url;
        a.download = r.filename || r.title;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        setPreview({
          url,
          title: r.title,
          mime: r.mime || "",
          text: r.mime === "text/plain" ? await blob.text() : undefined,
        });
      }
      setStatus("");
    } catch {
      setStatus(
        "This file could not be opened. Please retry or contact the instructor.",
      );
    } finally {
      setOpening(null);
    }
  }
  const selected = courses.find((c) => c.id === course);
  const available = resources.filter((r) => !course || r.course_id === course);
  const shown = available.filter(
    (r) =>
      (!unit || r.unit_id === unit) &&
      (!category || r.category === category) &&
      (r.title + " " + r.description + " " + r.tags.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const clear = () => {
    setCategory("");
    setUnit("");
    setQuery("");
  };
  return (
    <main id="main-content" className="site-container py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-7 text-sm text-muted">
        <Link href="/courses" className="underline underline-offset-4">
          Teaching
        </Link>
        <span aria-hidden="true"> / </span>
        {selected?.name || "Learning resources"}
      </nav>
      <div className="border-b border-line pb-8">
        <p className="eyebrow">
          {selected?.program || "Open academic resources"}
        </p>
        <h1 className="h1">{selected?.name || "Learning resources"}</h1>
        <p className="lead mt-4 max-w-3xl">
          {selected?.summary ||
            "Browse published notes, slides, and practical work across the course collection."}
        </p>
        <p className="mt-4 text-sm font-semibold text-teal-deep">
          Open access · No account needed
        </p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="space-y-6">
          <label className="grid gap-2 text-sm font-bold">
            Course
            <select
              className="form-input"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                clear();
                if (courseId) {
                  router.push(
                    e.target.value
                      ? phaseCourses.some((c) => c.id === e.target.value)
                        ? `/courses/${e.target.value}`
                        : `/student/#${e.target.value}`
                      : "/student",
                  );
                } else {
                  location.hash = e.target.value;
                }
              }}
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.program}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded border border-line bg-white p-4">
            <label className="grid gap-2 text-sm font-bold">
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
            <p className="mt-3 text-xs text-muted">
              Units appear as course materials are organised and published.
            </p>
          </div>
          <div className="border-l-2 border-teal-deep pl-4">
            <BookOpen size={22} className="text-teal-deep" />
            <h2 className="mt-3 font-serif text-xl text-navy">
              Study at your pace.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Read a topic, work through the examples, and use practical
              exercises to check your understanding.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block text-sm font-bold text-teal-deep"
            >
              Ask your instructor →
            </Link>
          </div>
        </aside>
        <section className="min-w-0" aria-label="Course materials">
          <label className="grid gap-2 text-sm font-bold">
            Search materials
            <input
              className="form-input"
              type="search"
              placeholder="Search a title, topic, or keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div
            className="my-5 flex flex-wrap gap-2"
            role="group"
            aria-label="Resource categories"
          >
            {[
              "",
              ...categories.filter((c) =>
                available.some((r) => r.category === c),
              ),
            ].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                className={
                  "btn " + (category === c ? "btn-primary" : "btn-secondary")
                }
                onClick={() => setCategory(c)}
              >
                {c || "All materials"}
              </button>
            ))}
          </div>
          <p role="status" className="mb-4 text-sm text-muted">
            {status ||
              (loading
                ? "Loading materials…"
                : `${shown.length} resource${shown.length === 1 ? "" : "s"}`)}
          </p>
          {error ? (
            <div role="alert" className="card">
              <h2 className="text-xl font-bold">
                Materials temporarily unavailable
              </h2>
              <p className="my-3 text-muted">{error}</p>
              <button
                className="btn btn-secondary"
                onClick={() => void reload()}
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div aria-busy="true" className="card">
              Loading published materials…
            </div>
          ) : !shown.length ? (
            <div className="rounded border border-dashed border-line bg-white px-6 py-12 text-center">
              <FileText className="mx-auto mb-4 text-teal-deep" size={30} />
              <h2 className="font-serif text-2xl text-navy">
                {query || unit || category
                  ? "No matching materials"
                  : "Materials will appear here"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                {query || unit || category
                  ? "Try another keyword or clear your filters."
                  : "Published notes, slides, and practical work will be available here as they are added. No login is required."}
              </p>
              {query || unit || category ? (
                <button className="btn btn-secondary mt-5" onClick={clear}>
                  Clear filters
                </button>
              ) : (
                <Link className="btn btn-secondary mt-5" href="/courses">
                  Browse courses
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {shown.map((r) => (
                <article key={r.id} className="card">
                  <div className="flex flex-wrap gap-2">
                    <span className="tag">{r.category}</span>
                    <span className="pill">
                      {units.find((u) => u.id === r.unit_id)?.title ||
                        "Course-wide"}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-2xl text-navy">
                    {r.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-muted">
                    {r.description}
                  </p>
                  <p className="my-4 text-xs text-muted">
                    {courses.find((c) => c.id === r.course_id)?.name} · Updated{" "}
                    {new Date(r.updated_at).toLocaleDateString("en-GB", {
                      timeZone: "UTC",
                    })}
                    {r.size ? ` · ${(r.size / 1024).toFixed(0)} KB` : ""}
                    {r.filename ? ` · ${r.filename}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {r.file_path &&
                    r.preview_enabled &&
                    [
                      "application/pdf",
                      "image/png",
                      "image/jpeg",
                      "text/plain",
                    ].includes(r.mime || "") ? (
                      <button
                        disabled={opening !== null}
                        className="btn btn-primary"
                        onClick={() => void open(r)}
                      >
                        Read online
                      </button>
                    ) : null}
                    {r.file_path && r.download_enabled ? (
                      <button
                        disabled={opening !== null}
                        className="btn btn-secondary"
                        onClick={() => void open(r, true)}
                      >
                        <Download size={16} />
                        Download
                      </button>
                    ) : null}
                    {r.external_url && /^https:\/\//i.test(r.external_url) ? (
                      <a
                        href={r.external_url}
                        className="btn btn-secondary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open reference ↗
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      {preview ? (
        <dialog
          ref={dialog}
          onCancel={(e) => {
            e.preventDefault();
            setPreview(null);
          }}
          aria-label={preview.title}
          className="fixed inset-0 m-auto max-h-[95vh] w-[96vw] max-w-6xl overflow-auto rounded bg-white p-5"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl text-navy">{preview.title}</h2>
            <button
              autoFocus
              className="btn btn-secondary"
              onClick={() => setPreview(null)}
            >
              Close
            </button>
          </div>
          {preview.text !== undefined ? (
            <pre className="overflow-auto whitespace-pre-wrap rounded bg-navy p-5 text-sm text-white">
              {preview.text}
            </pre>
          ) : preview.mime === "application/pdf" ? (
            <>
              <p className="mb-3 text-sm">
                If the preview is unavailable on your device, close it and use
                Download when offered.
              </p>
              <iframe
                src={preview.url}
                title={preview.title}
                className="h-[72vh] w-full"
              />
            </>
          ) : (
            <img
              src={preview.url}
              alt={preview.title}
              className="mx-auto max-h-[75vh]"
            />
          )}
        </dialog>
      ) : null}
    </main>
  );
}
