"use client";

import { ClipboardCheck, FileSpreadsheet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import type { UserProfile, UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const gradingRoles: UserRole[] = ["admin", "teacher", "student"];
type GradeRow = { id: string; student_id: string; assessment: string; score: number | null; max_score: number | null; status: string; feedback: string | null; updated_at: string; subjects: { name: string } | null; profiles: { full_name: string } | null };
type OptionRow = { id: string; name?: string; full_name?: string };

export function SecureGradingPortal() {
  return <AuthGate roles={gradingRoles}>{(profile) => <GradingPanel profile={profile} />}</AuthGate>;
}

function GradingPanel({ profile }: { profile: UserProfile }) {
  const staff = profile.role === "admin" || profile.role === "teacher";
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [students, setStudents] = useState<OptionRow[]>([]);
  const [subjects, setSubjects] = useState<OptionRow[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const gradeQuery = staff
      ? supabase.from("grades").select("id, student_id, assessment, score, max_score, status, feedback, updated_at, subjects(name), profiles(full_name)").order("updated_at", { ascending: false }).limit(100)
      : supabase.from("grades").select("id, student_id, assessment, score, max_score, status, feedback, updated_at, subjects(name), profiles(full_name)").eq("student_id", profile.id).order("updated_at", { ascending: false });
    const [gradeResult, studentResult, subjectResult] = await Promise.all([
      gradeQuery,
      staff ? supabase.from("profiles").select("id, full_name").eq("role", "student").order("full_name") : Promise.resolve({ data: [], error: null }),
      staff ? supabase.from("subjects").select("id, name").order("name") : Promise.resolve({ data: [], error: null })
    ]);
    if (gradeResult.error || studentResult.error || subjectResult.error) return setStatus("Assessment records could not be loaded. Please try again or contact the administrator.");
    setGrades((gradeResult.data || []) as unknown as GradeRow[]);
    setStudents((studentResult.data || []) as OptionRow[]);
    setSubjects((subjectResult.data || []) as OptionRow[]);
  }, [profile.id, staff]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function publishGrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !staff) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const scoreText = String(values.get("score") || "").trim();
    const maxText = String(values.get("max_score") || "").trim();
    const score = scoreText ? Number(scoreText) : null;
    const maxScore = maxText ? Number(maxText) : null;
    if (score !== null && maxScore !== null && score > maxScore) return setStatus("Score cannot be greater than the maximum score.");
    setBusy(true);
    const result = await supabase.from("grades").insert({
      student_id: String(values.get("student_id") || ""),
      subject_id: String(values.get("subject_id") || "") || null,
      assessment: String(values.get("assessment") || "").trim(),
      score,
      max_score: maxScore,
      status: String(values.get("status") || "published"),
      feedback: String(values.get("feedback") || "").trim() || null,
      updated_at: new Date().toISOString()
    });
    setBusy(false);
    if (result.error) return setStatus("The assessment could not be published. Check the details and try again.");
    form.reset();
    setStatus("The assessment has been published.");
    await refresh();
  }

  return (
    <main>
      <section className="page-hero py-12 text-white"><div className="site-container"><p className="eyebrow text-white/75">Assessment records</p><h1 className="h1 text-white">Grading portal</h1><p className="mt-4 max-w-2xl text-white/85">Students can review their own results and feedback. Teachers and administrators can record assessment outcomes.</p></div></section>
      <section className="section"><div className="site-container grid gap-6">
        {status ? <p role="status" className="rounded-lg border border-teal/20 bg-teal/10 p-4 text-sm font-bold text-teal-deep">{status}</p> : null}
        {staff ? <GradeForm students={students} subjects={subjects} busy={busy} onSubmit={publishGrade} /> : null}
        <section className="overflow-x-auto rounded-lg border border-line bg-white shadow-soft"><table className="min-w-[780px] w-full border-collapse"><thead><tr>{[...(staff ? ["Student"] : []), "Subject", "Assessment", "Status", "Score", "Feedback"].map((heading) => <th className="border-b border-line bg-teal/5 px-4 py-4 text-left text-xs font-extrabold uppercase text-navy" key={heading}>{heading}</th>)}</tr></thead><tbody>{grades.map((item) => <tr key={item.id}>{staff ? <Td>{item.profiles?.full_name || item.student_id}</Td> : null}<Td>{item.subjects?.name || "General"}</Td><Td>{item.assessment}</Td><Td>{item.status}</Td><Td>{item.score ?? "Pending"}{item.max_score ? ` / ${item.max_score}` : ""}</Td><Td>{item.feedback || "No feedback yet"}</Td></tr>)}</tbody></table>{!grades.length ? <p className="p-6 text-muted">No grade records are available.</p> : null}</section>
      </div></section>
    </main>
  );
}

function GradeForm({ students, subjects, busy, onSubmit }: { students: OptionRow[]; subjects: OptionRow[]; busy: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft md:grid-cols-2" onSubmit={onSubmit}><h2 className="h2 md:col-span-2"><FileSpreadsheet className="mr-2 inline" size={28} />Record an assessment</h2><Select name="student_id" label="Student" options={students.map((item) => [item.id, item.full_name || item.id])} /><Select name="subject_id" label="Subject" options={subjects.map((item) => [item.id, item.name || item.id])} /><Input name="assessment" label="Assessment" minLength={2} maxLength={180} /><Select name="status" label="Status" options={[["published", "Published"], ["pending", "Pending"], ["in_review", "In review"]]} /><Input name="score" label="Score" type="number" min="0" step="0.01" required={false} /><Input name="max_score" label="Maximum score" type="number" min="0.01" step="0.01" required={false} /><label className="grid gap-2 text-sm font-bold md:col-span-2">Feedback<textarea className="form-input min-h-28" name="feedback" maxLength={5000} /></label><button className="btn btn-primary justify-self-start md:col-span-2" disabled={busy} type="submit"><ClipboardCheck size={18} />{busy ? "Publishing..." : "Publish assessment"}</button></form>;
}

function Input({ label, required = true, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-2 text-sm font-bold">{label}<input {...props} className="form-input" required={required} /></label>;
}

function Select({ name, label, options }: { name: string; label: string; options: string[][] }) {
  return <label className="grid gap-2 text-sm font-bold">{label}<select className="form-input" name={name} required><option value="">Choose {label.toLowerCase()}</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-line px-4 py-4 text-sm text-slate-700">{children}</td>;
}
