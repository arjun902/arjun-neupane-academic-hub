"use client";

import Link from "next/link";
import { BellRing, BookOpenCheck, Download, FileCheck2, HelpCircle, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import type { UserProfile, UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const studentRoles: UserRole[] = ["student"];
const assignmentTypes = new Set(["application/pdf", "text/plain", "application/zip", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const programOptions = ["All", "BCA", "CSIT", "BE"];
const semesterOptions = ["All", "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];
type Tab = "overview" | "resources" | "grades" | "assignments" | "notices";
type ResourceRow = { id: string; title: string; program: string; semester: string | null; material_type: string; file_path: string | null; updated_at: string; subjects: { name: string } | null };
type GradeRow = { id: string; assessment: string; score: number | null; max_score: number | null; status: string; feedback: string | null; updated_at: string; subjects: { name: string } | null };
type NoticeRow = { id: string; title: string; body: string; notice_type: string; urgent: boolean; published_at: string };
type AssignmentRow = { id: string; title: string; status: string; feedback: string | null; submitted_at: string; subjects: { name: string } | null };
type SubjectRow = { id: string; name: string };

function normalizeSemester(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized || normalized === "All") return normalized || "";
  if (/^final$/i.test(normalized)) return "Semester 8";
  const match = normalized.match(/^(?:semester\s*)?([1-8])(?:st|nd|rd|th)?$/i);
  return match ? `Semester ${match[1]}` : normalized;
}

export function SecureStudentDashboard() {
  return <AuthGate roles={studentRoles}>{(profile) => <StudentPanel profile={profile} />}</AuthGate>;
}

function StudentPanel({ profile }: { profile: UserProfile }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [program, setProgram] = useState(() => {
    const initialProgram = profile.program?.trim();
    return initialProgram && programOptions.includes(initialProgram) ? initialProgram : "All";
  });
  const [semester, setSemester] = useState(() => normalizeSemester(profile.semester) || "All");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const [resourceResult, gradeResult, noticeResult, assignmentResult, subjectResult] = await Promise.all([
      supabase.from("materials").select("id, title, program, semester, material_type, file_path, updated_at, subjects(name)").eq("published", true).order("updated_at", { ascending: false }),
      supabase.from("grades").select("id, assessment, score, max_score, status, feedback, updated_at, subjects(name)").order("updated_at", { ascending: false }),
      supabase.from("notices").select("id, title, body, notice_type, urgent, published_at").eq("published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }),
      supabase.from("assignments").select("id, title, status, feedback, submitted_at, subjects(name)").order("submitted_at", { ascending: false }),
      supabase.from("subjects").select("id, name").order("name")
    ]);
    const error = resourceResult.error || gradeResult.error || noticeResult.error || assignmentResult.error || subjectResult.error;
    if (error) return setStatus("Your dashboard could not be loaded. Please try again or contact the administrator.");
    setResources((resourceResult.data || []) as unknown as ResourceRow[]);
    setGrades((gradeResult.data || []) as unknown as GradeRow[]);
    setNotices((noticeResult.data || []) as NoticeRow[]);
    setAssignments((assignmentResult.data || []) as unknown as AssignmentRow[]);
    setSubjects((subjectResult.data || []) as SubjectRow[]);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const filteredResources = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return resources.filter((item) =>
      (program === "All" || item.program === program) &&
      (semester === "All" || normalizeSemester(item.semester) === semester) &&
      (!needle || `${item.title} ${item.subjects?.name || ""} ${item.material_type}`.toLowerCase().includes(needle))
    );
  }, [program, query, resources, semester]);

  async function downloadResource(item: ResourceRow) {
    if (!supabase || !item.file_path) return setStatus("This resource does not have an uploaded file yet.");
    const result = await supabase.storage.from("materials").createSignedUrl(item.file_path, 60);
    if (result.error || !result.data.signedUrl) return setStatus("The file could not be opened. Please try again.");
    window.location.assign(result.data.signedUrl);
  }

  async function submitAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("file");
    if (!(file instanceof File) || !file.size) return setStatus("Choose an assignment file first.");
    if (file.size > 10 * 1024 * 1024) return setStatus("Assignment files must be 10 MB or smaller.");
    if (!assignmentTypes.has(file.type)) return setStatus("Use PDF, Word, text, or ZIP for assignments.");
    const title = String(values.get("title") || "").trim();
    const subjectId = String(values.get("subject_id") || "");
    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
    const path = `${profile.id}/${crypto.randomUUID()}-${safeName}`;
    setBusy(true);
    setStatus("");
    const upload = await supabase.storage.from("assignments").upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) {
      setBusy(false);
      return setStatus("The assignment could not be uploaded. Check the file and try again.");
    }
    const insert = await supabase.from("assignments").insert({ student_id: profile.id, subject_id: subjectId || null, title, file_path: path, status: "submitted" });
    if (insert.error) {
      await supabase.storage.from("assignments").remove([path]);
      setBusy(false);
      return setStatus("The assignment could not be recorded, so the uploaded file was removed. Please try again.");
    }
    form.reset();
    setBusy(false);
    setStatus("Assignment submitted successfully.");
    await refresh();
  }

  return (
    <main>
      <section className="page-hero py-12 text-white"><div className="site-container"><p className="eyebrow text-white/75">Your academic account</p><h1 className="h1 text-white">Student dashboard</h1><p className="mt-4 max-w-2xl text-white/85">Find your course files, assessment feedback, assignment history and current notices.</p></div></section>
      <section className="section">
        <div className="site-container grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="self-start rounded-lg bg-navy p-3 lg:sticky lg:top-24">{(["overview", "resources", "grades", "assignments", "notices"] as Tab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`block w-full rounded-lg px-3 py-3 text-left text-sm font-bold capitalize ${tab === item ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{item}</button>)}</aside>
          <div className="min-w-0">
            {status ? <p role="status" className="mb-5 rounded-lg border border-teal/20 bg-teal/10 p-4 text-sm font-bold text-teal-deep">{status}</p> : null}
            {tab === "overview" ? <Overview resources={resources.length} grades={grades.length} assignments={assignments} notices={notices.length} /> : null}
            {tab === "resources" ? <Resources resources={filteredResources} program={program} semester={semester} query={query} setProgram={setProgram} setSemester={setSemester} setQuery={setQuery} onDownload={downloadResource} /> : null}
            {tab === "grades" ? <Grades grades={grades} /> : null}
            {tab === "assignments" ? <Assignments items={assignments} subjects={subjects} busy={busy} onSubmit={submitAssignment} /> : null}
            {tab === "notices" ? <Notices notices={notices} /> : null}
            <Link className="btn btn-secondary mt-6" href="/contact?purpose=Student%20Support"><HelpCircle size={18} /> Ask for academic support</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Overview({ resources, grades, assignments, notices }: { resources: number; grades: number; assignments: AssignmentRow[]; notices: number }) {
  const metrics = [[resources, "Available resources", BookOpenCheck], [grades, "Grade updates", FileCheck2], [assignments.filter((item) => item.status !== "reviewed").length, "Open submissions", Upload], [notices, "Current notices", BellRing]] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([value, label, Icon]) => <article className="card" key={label}><Icon className="mb-3 text-teal-deep" size={22} /><strong className="block text-3xl text-navy">{value}</strong><span className="text-sm text-muted">{label}</span></article>)}</div>;
}

function Resources({ resources, program, semester, query, setProgram, setSemester, setQuery, onDownload }: { resources: ResourceRow[]; program: string; semester: string; query: string; setProgram: (value: string) => void; setSemester: (value: string) => void; setQuery: (value: string) => void; onDownload: (item: ResourceRow) => void }) {
  const availableSemesterOptions = semesterOptions.includes(semester) ? semesterOptions : [...semesterOptions, semester];
  return <div className="grid gap-5"><div className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-3"><label className="grid gap-2 text-sm font-bold">Search<input className="form-input" type="search" placeholder="Search by subject or resource" value={query} onChange={(event) => setQuery(event.target.value)} /></label><Select label="Program" value={program} onChange={setProgram} options={programOptions} /><Select label="Semester" value={semester} onChange={setSemester} options={availableSemesterOptions} /></div><DataList empty="No course resources match the current filters.">{resources.map((item) => <article className="grid gap-3 border-b border-line p-4 last:border-b-0 md:grid-cols-[1fr_auto]" key={item.id}><div><strong>{item.title}</strong><p className="mt-1 text-sm font-bold text-teal-deep">{item.subjects?.name || "General resource"}</p><p className="text-sm text-muted">{item.program} · {normalizeSemester(item.semester) || "All semesters"} · {item.material_type}</p></div><button className="btn btn-secondary" type="button" onClick={() => onDownload(item)}><Download size={17} /> Download</button></article>)}</DataList></div>;
}

function Grades({ grades }: { grades: GradeRow[] }) {
  return <DataList empty="No grades have been published for this account.">{grades.map((item) => <article className="border-b border-line p-4 last:border-b-0" key={item.id}><div className="flex flex-wrap justify-between gap-3"><strong>{item.subjects?.name || "Academic assessment"}: {item.assessment}</strong><span className="pill">{item.status}</span></div><p className="mt-2 text-sm">Score: {item.score ?? "Pending"}{item.max_score ? ` / ${item.max_score}` : ""}</p>{item.feedback ? <p className="mt-2 text-sm text-muted">{item.feedback}</p> : null}</article>)}</DataList>;
}

function Assignments({ items, subjects, busy, onSubmit }: { items: AssignmentRow[]; subjects: SubjectRow[]; busy: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="grid gap-6"><form className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft" onSubmit={onSubmit}><h2 className="h2">Submit an assignment</h2><label className="grid gap-2 text-sm font-bold">Assignment title<input className="form-input" name="title" minLength={3} maxLength={180} required /></label><label className="grid gap-2 text-sm font-bold">Subject<select className="form-input" name="subject_id" required><option value="">Choose a subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">File<input className="form-input" name="file" type="file" accept=".pdf,.doc,.docx,.txt,.zip" required /></label><button className="btn btn-primary justify-self-start" disabled={busy} type="submit">{busy ? "Uploading..." : "Submit assignment"}</button></form><DataList empty="You have not submitted an assignment yet.">{items.map((item) => <article className="border-b border-line p-4 last:border-b-0" key={item.id}><div className="flex flex-wrap justify-between gap-3"><strong>{item.title}</strong><span className="pill">{item.status}</span></div><p className="text-sm text-muted">{item.subjects?.name || "General"} · {new Date(item.submitted_at).toLocaleDateString()}</p>{item.feedback ? <p className="mt-2 text-sm">Feedback: {item.feedback}</p> : null}</article>)}</DataList></div>;
}

function Notices({ notices }: { notices: NoticeRow[] }) {
  return <DataList empty="No current notices.">{notices.map((item) => <article className={`border-b border-line p-4 last:border-b-0 ${item.urgent ? "border-l-4 border-l-plum" : ""}`} key={item.id}><div className="flex flex-wrap justify-between gap-3"><strong>{item.title}</strong><span className="tag">{item.notice_type}</span></div><p className="mt-2 text-sm text-muted">{item.body}</p></article>)}</DataList>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="grid gap-2 text-sm font-bold">{label}<select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function DataList({ children, empty }: { children: React.ReactNode; empty: string }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">{hasChildren ? children : <p className="p-6 text-muted">{empty}</p>}</section>;
}
