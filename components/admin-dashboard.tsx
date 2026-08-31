"use client";

import { BarChart3, BellRing, Download, FileUp, Inbox, ListChecks, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { academicPrograms } from "@/lib/academics";
import type { UserProfile, UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const staffRoles: UserRole[] = ["admin", "teacher"];
const allowedResourceTypes = new Set([
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);
const programOptions = [["CSIT", "BSc CSIT"], ["BCA", "BCA"], ["BE", "BE Computer Engineering"]] as const;
const semesterOptions = Array.from({ length: 8 }, (_, index) => {
  const number = String(index + 1);
  return [number, `Semester ${number}`] as const;
});
const resourceCategoryOptions = ["Notes", "Assignments", "Lab Reports", "Old Questions"].map((label) => [label, label] as const);

type Tab = "overview" | "subjects" | "resources" | "notices" | "submissions" | "messages";
type SubjectRow = { id: string; name: string; slug: string; program: string; semester: string | null; summary: string | null };
type ResourceRow = { id: string; title: string; program: string; semester: string | null; material_type: string; file_path: string | null; published: boolean; updated_at: string };
type AssignmentRow = { id: string; student_id: string; title: string; file_path: string; status: string; submitted_at: string; feedback: string | null };
type ContactRow = { id: string; name: string; email: string; purpose: string; subject: string; message: string; status: string; created_at: string };

export function SecureAdminDashboard() {
  return <AuthGate roles={staffRoles}>{(profile) => <AdminPanel profile={profile} />}</AuthGate>;
}

function AdminPanel({ profile }: { profile: UserProfile }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [messages, setMessages] = useState<ContactRow[]>([]);
  const [counts, setCounts] = useState({ resources: 0, subjects: 0, students: 0, assignments: 0, messages: 0 });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const [resourceResult, subjectResult, studentResult, assignmentResult, messageResult] = await Promise.all([
      supabase.from("materials").select("id, title, program, semester, material_type, file_path, published, updated_at").order("updated_at", { ascending: false }).limit(30),
      supabase.from("subjects").select("id, name, slug, program, semester, summary").order("name"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("assignments").select("id, student_id, title, file_path, status, submitted_at, feedback").order("submitted_at", { ascending: false }).limit(30),
      profile.role === "admin"
        ? supabase.from("contact_messages").select("id, name, email, purpose, subject, message, status, created_at").order("created_at", { ascending: false }).limit(30)
        : Promise.resolve({ data: [], error: null, count: 0 })
    ]);

    if (resourceResult.error || subjectResult.error || studentResult.error || assignmentResult.error || messageResult.error) {
      setStatus("Some dashboard information could not be loaded. Please refresh the page or contact the administrator.");
      return;
    }
    setResources((resourceResult.data || []) as ResourceRow[]);
    setSubjects((subjectResult.data || []) as SubjectRow[]);
    setAssignments((assignmentResult.data || []) as AssignmentRow[]);
    setMessages((messageResult.data || []) as ContactRow[]);
    setCounts({
      resources: resourceResult.data?.length || 0,
      subjects: subjectResult.data?.length || 0,
      students: studentResult.count || 0,
      assignments: assignmentResult.data?.filter((item) => item.status !== "reviewed").length || 0,
      messages: messageResult.data?.filter((item) => item.status === "new").length || 0
    });
  }, [profile.role]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function uploadResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("file");
    if (!(file instanceof File) || !file.size) return setStatus("Choose a course resource file first.");
    if (file.size > 20 * 1024 * 1024) return setStatus("Course resource files must be 20 MB or smaller.");
    if (!allowedResourceTypes.has(file.type)) return setStatus("Unsupported file type. Use PDF, Office, text, or ZIP files.");

    setBusy(true);
    setStatus("");
    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
    const filePath = `resources/${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("materials").upload(filePath, file, { contentType: file.type, upsert: false });
    if (upload.error) {
      setStatus("The file could not be uploaded. Please check it and try again.");
      setBusy(false);
      return;
    }

    const insert = await supabase.from("materials").insert({
      title: String(values.get("title") || "").trim(),
      subject_id: String(values.get("subject_id") || "") || null,
      program: String(values.get("program") || "").trim(),
      semester: String(values.get("semester") || "").trim() || null,
      material_type: String(values.get("material_type") || "").trim(),
      file_path: filePath,
      published: values.get("published") === "on"
    });
    if (insert.error) {
      await supabase.storage.from("materials").remove([filePath]);
      setStatus("The resource details could not be saved, so the uploaded file was removed. Please check the form and try again.");
      setBusy(false);
      return;
    }
    form.reset();
    setStatus("Course resource uploaded successfully.");
    setBusy(false);
    await refresh();
  }

  async function createSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const program = String(values.get("program") || "").trim();
    const semester = String(values.get("semester") || "").trim();
    const baseSlug = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${program.toLowerCase()}-s${semester}`;
    const result = await supabase.from("subjects").insert({
      name,
      slug,
      program,
      semester,
      summary: String(values.get("summary") || "").trim() || null
    });
    if (result.error) return setStatus("Subject could not be created. Check whether the name or slug already exists.");
    form.reset();
    setStatus("Subject created successfully.");
    await refresh();
  }

  async function toggleResource(item: ResourceRow) {
    if (!supabase) return;
    const result = await supabase.from("materials").update({ published: !item.published, updated_at: new Date().toISOString() }).eq("id", item.id);
    setStatus(result.error ? "Course resource status could not be updated." : `Course resource ${item.published ? "unpublished" : "published"}.`);
    await refresh();
  }

  async function publishNotice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    const result = await supabase.from("notices").insert({
      title: String(values.get("title") || "").trim(),
      body: String(values.get("body") || "").trim(),
      notice_type: String(values.get("notice_type") || "Academic update"),
      urgent: values.get("urgent") === "on",
      published: true,
      published_at: new Date().toISOString()
    });
    setBusy(false);
    if (result.error) return setStatus("Notice could not be published. Check the required fields.");
    form.reset();
    setStatus("Notice published successfully.");
  }

  async function reviewAssignment(id: string) {
    if (!supabase) return;
    const feedback = window.prompt("Feedback for the student (optional):", "Reviewed. Please see the notes from your teacher.");
    if (feedback === null) return;
    const result = await supabase.from("assignments").update({ status: "reviewed", feedback: feedback.slice(0, 5000), updated_at: new Date().toISOString() }).eq("id", id);
    setStatus(result.error ? "Submission could not be updated." : "Submission marked as reviewed.");
    await refresh();
  }

  async function downloadAssignment(item: AssignmentRow) {
    if (!supabase) return;
    const result = await supabase.storage.from("assignments").createSignedUrl(item.file_path, 60);
    if (result.error || !result.data.signedUrl) return setStatus("The private submission file could not be opened.");
    window.location.assign(result.data.signedUrl);
  }

  async function markMessageRead(id: string) {
    if (!supabase) return;
    const result = await supabase.from("contact_messages").update({ status: "read" }).eq("id", id);
    setStatus(result.error ? "Message status could not be updated." : "Message marked as read.");
    await refresh();
  }

  return (
    <main>
      <section className="page-hero py-12 text-white">
        <div className="site-container"><p className="eyebrow text-white/75">Teaching and administration</p><h1 className="h1 text-white">Staff dashboard</h1><p className="mt-4 max-w-2xl text-white/85">Manage the subject catalog, course files, notices, student submissions and enquiries.</p></div>
      </section>
      <section className="section">
        <div className="site-container grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="self-start rounded-lg bg-navy p-3 lg:sticky lg:top-24">
            {(["overview", "subjects", "resources", "notices", "submissions", ...(profile.role === "admin" ? ["messages"] : [])] as Tab[]).map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={`block w-full rounded-lg px-3 py-3 text-left text-sm font-bold capitalize ${tab === item ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{item}</button>
            ))}
          </aside>
          <div className="min-w-0">
            {status ? <p role="status" className="mb-5 rounded-lg border border-teal/20 bg-teal/10 p-4 text-sm font-bold text-teal-deep">{status}</p> : null}
            {tab === "overview" ? <Overview counts={counts} /> : null}
            {tab === "subjects" ? <SubjectPanel subjects={subjects} onSubmit={createSubject} /> : null}
            {tab === "resources" ? <ResourcePanel resources={resources} subjects={subjects} busy={busy} onUpload={uploadResource} onToggle={toggleResource} /> : null}
            {tab === "notices" ? <NoticePanel busy={busy} onSubmit={publishNotice} /> : null}
            {tab === "submissions" ? <SubmissionPanel assignments={assignments} onDownload={downloadAssignment} onReview={reviewAssignment} /> : null}
            {tab === "messages" ? <MessagePanel messages={messages} onRead={markMessageRead} /> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Overview({ counts }: { counts: { resources: number; subjects: number; students: number; assignments: number; messages: number } }) {
  const metrics = [
    [counts.resources, "Course resources", BarChart3],
    [counts.subjects, "Catalog subjects", ListChecks],
    [counts.students, "Registered students", ListChecks],
    [counts.assignments, "Pending submissions", FileUp],
    [counts.messages, "New messages", Inbox]
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([value, label, Icon]) => <article className="card" key={label}><Icon className="mb-3 text-teal-deep" size={22} /><strong className="block text-3xl text-navy">{value}</strong><span className="text-sm text-muted">{label}</span></article>)}</div>;
}

function ResourcePanel({ resources, subjects, busy, onUpload, onToggle }: { resources: ResourceRow[]; subjects: SubjectRow[]; busy: boolean; onUpload: (event: React.FormEvent<HTMLFormElement>) => void; onToggle: (item: ResourceRow) => void }) {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const program = academicPrograms.find((item) => item.shortName === selectedProgram);
  const semester = program?.semesters.find((item) => String(item.number) === selectedSemester);
  const offeredNames = new Set<string>(semester?.offerings.map((item) => item.name) || []);
  const availableSubjects = subjects.filter((subject) => offeredNames.has(subject.name));

  return (
    <div className="grid gap-6">
      <form className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft md:grid-cols-2" onSubmit={onUpload}>
        <h2 className="h2 md:col-span-2"><UploadCloud className="mr-2 inline" size={28} />Upload course resource</h2>
        <label className="grid gap-2 text-sm font-extrabold">
          Program
          <select
            className="form-input"
            name="program"
            value={selectedProgram}
            onChange={(event) => { setSelectedProgram(event.target.value); setSelectedSemester(""); }}
            required
          >
            <option value="" disabled>Choose program</option>
            {programOptions.map(([value, display]) => <option key={value} value={value}>{display}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-extrabold">
          Semester
          <select
            className="form-input disabled:cursor-not-allowed disabled:opacity-60"
            name="semester"
            value={selectedSemester}
            onChange={(event) => setSelectedSemester(event.target.value)}
            disabled={!selectedProgram}
            required
          >
            <option value="" disabled>Choose semester</option>
            {semesterOptions.map(([value, display]) => <option key={value} value={value}>{display}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-extrabold">
          Subject
          <select className="form-input disabled:cursor-not-allowed disabled:opacity-60" key={`${selectedProgram}-${selectedSemester}`} name="subject_id" disabled={!selectedSemester} required>
            <option value="">Choose a subject</option>
            {availableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
        </label>
        <StaticSelect name="material_type" label="Resource type" options={resourceCategoryOptions} />
        <Input name="title" label="Resource title" minLength={3} maxLength={180} />
        <label className="grid gap-2 text-sm font-extrabold">
          File
          <input className="form-input" name="file" type="file" accept=".pdf,.txt,.zip,.doc,.docx,.ppt,.pptx" required />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold"><input name="published" type="checkbox" /> Publish immediately</label>
        <button className="btn btn-primary md:justify-self-end" disabled={busy} type="submit">{busy ? "Uploading..." : "Upload resource"}</button>
      </form>
      <DataList empty="No course resources have been added yet.">
        {resources.map((item) => (
          <div className="grid gap-3 border-b border-line p-4 last:border-b-0 md:grid-cols-[1fr_auto]" key={item.id}>
            <div><strong>{item.title}</strong><p className="text-sm text-muted">{item.program} · {item.semester ? `Semester ${item.semester.replace(/\D/g, "") || item.semester}` : "All semesters"} · {item.material_type}</p></div>
            <button className="btn btn-secondary" type="button" onClick={() => onToggle(item)}>{item.published ? "Unpublish" : "Publish"}</button>
          </div>
        ))}
      </DataList>
    </div>
  );
}

function SubjectPanel({ subjects, onSubmit }: { subjects: SubjectRow[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="grid gap-6"><form className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft md:grid-cols-2" onSubmit={onSubmit}><h2 className="h2 md:col-span-2">Add a subject to the catalog</h2><Input name="name" label="Subject name" minLength={2} maxLength={160} /><StaticSelect name="program" label="Program" options={programOptions} /><StaticSelect name="semester" label="Semester" options={semesterOptions} /><label className="grid gap-2 text-sm font-extrabold md:col-span-2">Summary<textarea className="form-input min-h-28" name="summary" maxLength={2000} /></label><button className="btn btn-primary justify-self-start md:col-span-2" type="submit">Add subject</button></form><DataList empty="No subjects have been added to the catalog yet.">{subjects.map((item) => <div className="border-b border-line p-4 last:border-b-0" key={item.id}><strong>{item.name}</strong><p className="text-sm text-muted">{item.program} · {item.semester ? `Semester ${item.semester.replace(/\D/g, "") || item.semester}` : "Semester varies by program"} · /{item.slug}</p></div>)}</DataList></div>;
}

function NoticePanel({ busy, onSubmit }: { busy: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft" onSubmit={onSubmit}><h2 className="h2"><BellRing className="mr-2 inline" size={28} />Publish notice</h2><Input name="title" label="Title" minLength={3} maxLength={180} /><Input name="notice_type" label="Notice type" minLength={2} maxLength={80} /><label className="grid gap-2 text-sm font-extrabold">Message<textarea className="form-input min-h-36" name="body" minLength={3} maxLength={5000} required /></label><label className="flex items-center gap-2 text-sm font-bold"><input name="urgent" type="checkbox" /> Mark urgent</label><button className="btn btn-primary justify-self-start" disabled={busy} type="submit">{busy ? "Publishing..." : "Publish notice"}</button></form>;
}

function SubmissionPanel({ assignments, onDownload, onReview }: { assignments: AssignmentRow[]; onDownload: (item: AssignmentRow) => void; onReview: (id: string) => void }) {
  return <DataList empty="No assignment submissions yet.">{assignments.map((item) => <div className="grid gap-3 border-b border-line p-4 last:border-b-0 md:grid-cols-[1fr_auto]" key={item.id}><div><strong>{item.title}</strong><p className="text-sm text-muted">Student: {item.student_id} · {item.status} · {new Date(item.submitted_at).toLocaleDateString()}</p>{item.feedback ? <p className="mt-1 text-sm">{item.feedback}</p> : null}</div><div className="flex flex-wrap gap-2"><button className="btn btn-secondary" type="button" onClick={() => onDownload(item)}><Download size={17} /> Open file</button>{item.status !== "reviewed" ? <button className="btn btn-secondary" type="button" onClick={() => onReview(item.id)}>Review</button> : null}</div></div>)}</DataList>;
}

function MessagePanel({ messages, onRead }: { messages: ContactRow[]; onRead: (id: string) => void }) {
  return <DataList empty="No contact messages yet.">{messages.map((item) => <div className="border-b border-line p-4 last:border-b-0" key={item.id}><div className="flex flex-wrap justify-between gap-3"><strong>{item.subject}</strong><span className="pill">{item.status}</span></div><p className="mt-1 text-sm text-muted">{item.name} · {item.email} · {item.purpose}</p><p className="mt-3 whitespace-pre-wrap text-sm">{item.message}</p>{item.status === "new" ? <button className="btn btn-secondary mt-3" type="button" onClick={() => onRead(item.id)}>Mark read</button> : null}</div>)}</DataList>;
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <label className="grid gap-2 text-sm font-extrabold">{label}<input {...props} className="form-input" required={props.name !== "semester"} /></label>;
}

function StaticSelect({ name, label, options }: { name: string; label: string; options: readonly (readonly [string, string])[] }) {
  return <label className="grid gap-2 text-sm font-extrabold">{label}<select className="form-input" name={name} defaultValue="" required><option value="" disabled>Choose {label.toLowerCase()}</option>{options.map(([value, display]) => <option key={value} value={value}>{display}</option>)}</select></label>;
}

function DataList({ children, empty }: { children: React.ReactNode; empty: string }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">{hasChildren ? children : <p className="p-6 text-muted">{empty}</p>}</section>;
}
