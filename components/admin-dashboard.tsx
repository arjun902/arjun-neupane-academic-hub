"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { CoursePasswordAdmin } from "@/components/course-password-admin";
import { adminAction } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { fetchRows } from "@/lib/fetch-rows";
import {
  categories,
  phaseCourses,
  type Account,
  type Course,
  type Resource,
  type Unit,
} from "@/lib/portal";
type Enrollment = {
  student_id: string;
  course_id: string;
  expires_at: string | null;
};
const field = (f: FormData, n: string) => String(f.get(n) || "").trim();
const date = (s: string) => (s ? new Date(s).toISOString() : null);
const localDate = (s: string | null) =>
  s
    ? new Date(Date.parse(s) - new Date(s).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";
const types: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  c: "text/plain",
  h: "text/plain",
  cpp: "text/plain",
  py: "text/plain",
  java: "text/plain",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
export function SecureAdminDashboard() {
  return (
    <AuthGate roles={["admin"]}>
      <AdminPanel />
    </AuthGate>
  );
}
function AdminPanel() {
  const [tab, setTab] = useState("Overview"),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]),
    [courses, setCourses] = useState<Course[]>([]),
    [units, setUnits] = useState<Unit[]>([]),
    [resources, setResources] = useState<Resource[]>([]),
    [enrollments, setEnrollments] = useState<Enrollment[]>([]),
    [audit, setAudit] = useState<
      { id: number; action: string; entity: string; created_at: string }[]
    >([]),
    [announcements, setAnnouncements] = useState<
      { id: string; title: string; published: boolean }[]
    >([]);
  const [credential, setCredential] = useState<{
      email: string;
      password: string;
    } | null>(null),
    [student, setStudent] = useState<Account | null>(null),
    [editCourse, setEditCourse] = useState<Course | null>(null),
    [editResource, setEditResource] = useState<Resource | null>(null),
    [file, setFile] = useState<File | null>(null),
    [uploadCourse, setUploadCourse] = useState(""),
    [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const newResourceId = useRef<string | null>(null);
  const refresh = useCallback(async () => {
    if (!supabase) return "Portal configuration is unavailable.";
    const r = await Promise.all([
      fetchRows((start, end) =>
        supabase!
          .from("hub_accounts")
          .select("*")
          .order("full_name")
          .order("id")
          .range(start, end),
      ),
      fetchRows((start, end) =>
        supabase!
          .from("hub_courses")
          .select("*")
          .order("display_order")
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
          .from("hub_resources")
          .select("*")
          .order("updated_at", { ascending: false })
          .order("id")
          .range(start, end),
      ),
      fetchRows((start, end) =>
        supabase!
          .from("hub_enrollments")
          .select("*")
          .order("student_id")
          .order("course_id")
          .range(start, end),
      ),
      supabase
        .from("hub_audit")
        .select("id,action,entity,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      fetchRows((start, end) =>
        supabase!
          .from("hub_announcements")
          .select("id,title,published")
          .order("created_at", { ascending: false })
          .order("id")
          .range(start, end),
      ),
    ]).catch(() => null);
    if (!r || r.some((x) => x.error)) {
      setAccounts([]);
      setCourses([]);
      setUnits([]);
      setResources([]);
      setEnrollments([]);
      setAudit([]);
      setAnnouncements([]);
      return "Dashboard could not load. Check your connection and administrator access, then refresh.";
    }
    setAccounts(r[0].data || []);
    setCourses(
      (r[1].data || []).filter((c) => phaseCourses.some((p) => p.id === c.id)),
    );
    setUnits(r[2].data || []);
    setResources(r[3].data || []);
    setEnrollments(r[4].data || []);
    setAudit(r[5].data || []);
    setAnnouncements(r[6].data || []);
    return null;
  }, []);
  useEffect(() => {
    void refresh().then((error) => {
      if (error) setStatus(error);
    });
  }, [refresh]);
  async function run(task: () => Promise<void | string>) {
    setBusy(true);
    setStatus("");
    try {
      const warning = await task();
      const refreshError = await refresh();
      setStatus(
        [warning || "Saved successfully.", refreshError]
          .filter(Boolean)
          .join(" "),
      );
    } catch (e) {
      setStatus((e as Error).message || "Could not save. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  async function save(table: string, value: Record<string, unknown>) {
    const r = await supabase!.from(table).upsert(value);
    if (r.error) throw Error(r.error.message);
  }
  async function resourceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const v = new FormData(form);
    await run(async () => {
      let path = editResource?.file_path || null,
        filename = editResource?.filename || null,
        mime = editResource?.mime || null,
        size = editResource?.size || null;
      let uploaded: string | null = null;
      const external = field(v, "external_url") || null;
      if (external && !/^https:\/\//.test(external))
        throw Error("External links must start with https://");
      if (file && external) throw Error("Choose a file OR an external link.");
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        mime = types[ext];
        if (!mime || file.size < 1 || file.size > 20971520)
          throw Error("Use a supported file of 20 MB or less.");
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        path = crypto.randomUUID() + "/" + safe;
        filename = file.name;
        size = file.size;
        const { data } = await supabase!.auth.getSession();
        if (!data.session) throw Error("Sign in again.");
        setProgress(0);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            process.env.NEXT_PUBLIC_SUPABASE_URL +
              "/storage/v1/object/hub-materials/" +
              path,
          );
          xhr.setRequestHeader(
            "Authorization",
            "Bearer " + data.session!.access_token,
          );
          xhr.setRequestHeader(
            "apikey",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );
          xhr.setRequestHeader("Content-Type", mime!);
          xhr.setRequestHeader("cache-control", "no-store");
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable)
              setProgress(Math.round((ev.loaded / ev.total) * 100));
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(
                  Error(
                    "Upload failed. Your file selection is retained; retry.",
                  ),
                );
          xhr.onerror = () =>
            reject(Error("Connection interrupted. Retry the upload."));
          xhr.timeout = 120000;
          xhr.ontimeout = () => reject(Error("Upload timed out. Retry."));
          xhr.send(file);
        });
        uploaded = path;
      }
      if (!path && !external)
        throw Error("Select a file or provide an external reference.");
      const record = {
        id: editResource?.id || (newResourceId.current ??= crypto.randomUUID()),
        course_id: field(v, "course_id"),
        unit_id: field(v, "unit_id") || null,
        title: field(v, "title"),
        description: field(v, "description"),
        category: field(v, "category"),
        file_path: external ? null : path,
        filename: external ? null : filename,
        mime: external ? null : mime,
        size: external ? null : size,
        external_url: external,
        tags: field(v, "tags")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: field(v, "status"),
        release_at: date(field(v, "release_at")),
        display_order: Number(field(v, "display_order")),
        preview_enabled: v.get("preview_enabled") === "on",
        download_enabled: v.get("download_enabled") === "on",
        updated_at: new Date().toISOString(),
      };
      let warning = "";
      try {
        await save("hub_resources", record);
      } catch (e) {
        if (uploaded) {
          // A lost response does not prove the transaction failed. Never delete
          // the uploaded object until its commit outcome can be established.
          const confirmation = await supabase!
            .from("hub_resources")
            .select("file_path,updated_at")
            .eq("id", record.id)
            .maybeSingle();
          if (
            confirmation.error ||
            confirmation.data?.file_path !== uploaded ||
            (confirmation.data?.updated_at &&
              Date.parse(confirmation.data.updated_at) !==
                Date.parse(record.updated_at))
          ) {
            throw Error(
              "The save could not be confirmed. Your uploaded file has been retained privately. Refresh the resource library before retrying; no existing file was deleted.",
            );
          }
          warning =
            "Saved successfully; the interrupted response was verified against the resource library.";
        } else {
          throw e;
        }
      }
      // Old files remain private and inaccessible after replacement; remove only after metadata succeeds.
      if (
        editResource?.file_path &&
        editResource.file_path !== record.file_path
      ) {
        const cleanup = await supabase!.storage
          .from("hub-materials")
          .remove([editResource.file_path]);
        if (cleanup.error)
          warning =
            "Saved successfully. The old private file could not be removed; ask the site administrator to clean it up in Storage.";
      }
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      newResourceId.current = null;
      setEditResource(null);
      setUploadCourse("");
      setProgress(0);
      form.reset();
      return warning;
    });
  }
  return (
    <main id="main-content" className="site-container py-9">
      <p className="eyebrow">Instructor workspace</p>
      <h1 className="h2">Academic administration</h1>
      <p className="mt-2 text-muted">
        Manage private backend resources. Public website content is maintained in
        the repository content files and published through GitHub Pages.
      </p>
      <div className="mt-7 grid gap-6 lg:grid-cols-[210px_1fr]">
        <nav
          aria-label="Administration"
          className="flex flex-wrap gap-2 self-start rounded-lg bg-navy p-3 lg:grid"
        >
          {[
            "Overview",
            "Course passwords",
            "Students",
            "Courses & units",
            "Materials",
            "Announcements",
            "Audit trail",
          ].map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === tab}
              className="tab-button"
              onClick={() => {
                setTab(t);
                setCredential(null);
              }}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          <p role="status" className="mb-4 whitespace-pre-wrap text-sm">
            {status}
          </p>
          <button
            type="button"
            className="btn btn-secondary mb-4"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                setStatus((await refresh()) || "Dashboard refreshed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Refresh dashboard
          </button>
          {tab === "Overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  [
                    accounts.filter((a) => a.role === "student").length,
                    "Legacy student accounts",
                  ],
                  [courses.length, "Courses"],
                  [
                    resources.filter(
                      (r) =>
                        r.status === "published" &&
                        (!r.release_at ||
                          Date.parse(r.release_at) <= Date.now()),
                    ).length,
                    "Published resources",
                  ],
                ].map(([n, l]) => (
                  <article key={l} className="card">
                    <strong className="block text-3xl text-navy">{n}</strong>
                    <span>{l}</span>
                  </article>
                ))}
              </div>
              <section className="card mt-5">
                <h2 className="text-xl font-bold">Start with the essentials</h2>
                <p className="mt-2 text-muted">
                  Set each course password in Course passwords, enable access,
                  and distribute it to your class. Upload materials as drafts
                  and publish them when ready. Student accounts are not
                  required.
                </p>
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => setTab("Materials")}
                >
                  Upload material
                </button>
              </section>
            </>
          )}
          {tab === "Course passwords" && (
            <CoursePasswordAdmin courses={courses} />
          )}
          {tab === "Students" && (
            <>
              <p className="mb-4 text-sm text-muted">
                Legacy account administration is retained for existing records.
                These accounts and enrollments do not grant access to the
                course-password library.
              </p>
              <h2 className="mb-4 text-2xl font-bold">
                {student ? "Edit student" : "Create student account"}
              </h2>
              <form
                key={student?.id || "new"}
                className="card grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void run(async () => {
                    const result = await adminAction({
                      action: student ? "update-student" : "create-student",
                      student_id: student?.id,
                      full_name: field(f, "full_name"),
                      email: field(f, "email"),
                      status: field(f, "status") || "active",
                      expires_at: date(field(f, "expires_at")),
                    });
                    if (result.temporary_password)
                      setCredential({
                        email: field(f, "email"),
                        password: result.temporary_password,
                      });
                    setStudent(null);
                  });
                }}
              >
                <Field
                  label="Full name"
                  name="full_name"
                  required
                  minLength={2}
                  maxLength={120}
                  defaultValue={student?.full_name}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  required
                  disabled={!!student}
                  defaultValue={student?.email}
                />
                <Field
                  label="Account expiry (optional, local time)"
                  name="expires_at"
                  type="datetime-local"
                  defaultValue={localDate(student?.expires_at || null)}
                />
                {student && (
                  <label>
                    Status
                    <select
                      name="status"
                      className="form-input"
                      defaultValue={student.status}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </label>
                )}
                <div className="flex gap-2">
                  <button disabled={busy} className="btn btn-primary">
                    {student ? "Save student" : "Create & generate password"}
                  </button>
                  {student && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setStudent(null)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              {credential && (
                <section
                  className="my-5 rounded-lg border-2 border-teal bg-white p-5"
                  aria-label="One-time credential"
                >
                  <h3 className="font-bold">
                    Provide this credential manually
                  </h3>
                  <p>{credential.email}</p>
                  <code className="my-3 block break-all rounded bg-slate-100 p-3">
                    {credential.password}
                  </code>
                  <p className="text-sm">
                    Shown only in this session. No email is sent. The student
                    must replace it on first sign-in.
                  </p>
                  <button
                    className="btn btn-secondary mt-3"
                    onClick={() => setCredential(null)}
                  >
                    I have saved it · dismiss
                  </button>
                </section>
              )}
              <h2 className="mb-3 mt-8 text-xl font-bold">
                Students & course access
              </h2>
              {accounts
                .filter((a) => a.role === "student")
                .map((a) => (
                  <article className="card mb-4" key={a.id}>
                    <h3 className="font-bold">
                      {a.full_name} <span className="pill">{a.status}</span>
                    </h3>
                    <p className="break-all text-sm">{a.email}</p>
                    <p className="text-xs text-muted">
                      Account expiry:{" "}
                      {a.expires_at
                        ? new Date(a.expires_at).toLocaleString()
                        : "No expiry"}{" "}
                      ·{" "}
                      {a.must_change_password
                        ? "Password change required"
                        : "Password set"}
                    </p>
                    <div className="my-3 flex flex-wrap gap-2">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setStudent(a)}
                      >
                        Edit account
                      </button>
                      <button
                        className="btn btn-secondary"
                        disabled={busy}
                        onClick={() => {
                          if (
                            confirm(
                              "Reset credentials for " +
                                a.full_name +
                                "? Their old sessions will lose access.",
                            )
                          )
                            void run(async () => {
                              const r = await adminAction({
                                action: "reset-password",
                                student_id: a.id,
                              });
                              setCredential({
                                email: a.email,
                                password: r.temporary_password,
                              });
                            });
                        }}
                      >
                        Reset credentials
                      </button>
                    </div>
                    {enrollments
                      .filter((e) => e.student_id === a.id)
                      .map((e) => (
                        <div
                          className="my-2 flex flex-wrap items-center gap-2 border-t border-line pt-2 text-sm"
                          key={e.course_id}
                        >
                          <strong>
                            {courses.find((c) => c.id === e.course_id)?.name}
                          </strong>
                          <span>
                            {e.expires_at
                              ? "Until " +
                                new Date(e.expires_at).toLocaleString()
                              : "No expiry"}
                          </span>
                          <button
                            type="button"
                            className="btn btn-danger"
                            disabled={busy}
                            onClick={() => {
                              if (confirm("Revoke this course?"))
                                void run(async () => {
                                  await adminAction({
                                    action: "revoke",
                                    student_id: a.id,
                                    course_id: e.course_id,
                                  });
                                });
                            }}
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    <form
                      className="mt-4 grid gap-3 sm:grid-cols-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        void run(async () => {
                          await adminAction({
                            action: "enroll",
                            student_id: a.id,
                            course_id: field(f, "course_id"),
                            expires_at: date(field(f, "expires_at")),
                          });
                        });
                      }}
                    >
                      <label className="text-sm">
                        Assign / extend course
                        <select
                          className="form-input"
                          required
                          name="course_id"
                        >
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Field
                        label="Enrollment expiry (optional)"
                        type="datetime-local"
                        name="expires_at"
                      />
                      <button
                        className="btn btn-primary self-end"
                        disabled={busy}
                      >
                        Save access
                      </button>
                    </form>
                  </article>
                ))}
              {!accounts.some((a) => a.role === "student") && (
                <p>No students yet. Create your first account above.</p>
              )}
            </>
          )}
          {tab === "Courses & units" && (
            <>
              <h2 className="mb-4 text-2xl font-bold">
                {editCourse ? "Edit course" : "Courses & units"}
              </h2>
              {editCourse && (
                <form
                  key={editCourse?.id || "course"}
                  className="card grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void run(async () => {
                      await save("hub_courses", {
                        id: editCourse?.id || field(f, "id"),
                        name: field(f, "name"),
                        program: field(f, "program"),
                        summary: field(f, "summary"),
                        visible: f.get("visible") === "on",
                        code: field(f, "code") || null,
                        semester: field(f, "semester") || null,
                        credits: field(f, "credits") || null,
                        syllabus_version: field(f, "syllabus_version") || null,
                      });
                      setEditCourse(null);
                    });
                  }}
                >
                  <Field
                    label="Course name"
                    name="name"
                    required
                    defaultValue={editCourse?.name}
                  />
                  <Field
                    label="Stable ID (lowercase and hyphens)"
                    name="id"
                    pattern="[a-z0-9-]+"
                    required
                    disabled={!!editCourse}
                    defaultValue={editCourse?.id}
                  />
                  <Field
                    label="Programme"
                    name="program"
                    required
                    defaultValue={editCourse?.program}
                  />
                  <Field
                    label="Short public description"
                    name="summary"
                    required
                    defaultValue={editCourse?.summary}
                  />
                  {(
                    ["code", "semester", "credits", "syllabus_version"] as const
                  ).map((n) => (
                    <Field
                      key={n}
                      label={n.replace("_", " ") + " (verified only)"}
                      name={n}
                      defaultValue={editCourse?.[n] || ""}
                    />
                  ))}
                  <label>
                    <input
                      type="checkbox"
                      name="visible"
                      defaultChecked={editCourse?.visible}
                    />{" "}
                    Show in public catalogue
                  </label>
                  <button disabled={busy} className="btn btn-primary">
                    Save course
                  </button>
                  {editCourse && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditCourse(null)}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              )}
              <p className="my-4 text-sm text-muted">
                Leave official metadata blank until you verify the current TU
                syllabus.
              </p>
              {courses.map((c) => (
                <article className="card mb-3" key={c.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <h3 className="font-bold">
                      {c.name} · {c.program}
                    </h3>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditCourse(c)}
                    >
                      Edit course
                    </button>
                  </div>
                  {units
                    .filter((u) => u.course_id === c.id)
                    .map((u) => (
                      <form
                        key={u.id}
                        className="mt-3 flex flex-wrap gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          void run(() =>
                            save("hub_units", {
                              ...u,
                              title: field(f, "title"),
                              display_order: Number(field(f, "order")),
                            }),
                          );
                        }}
                      >
                        <Field
                          label="Unit title"
                          name="title"
                          defaultValue={u.title}
                          required
                        />
                        <Field
                          label="Order"
                          name="order"
                          type="number"
                          defaultValue={u.display_order}
                        />
                        <button
                          className="btn btn-secondary self-end"
                          disabled={busy}
                        >
                          Update unit
                        </button>
                      </form>
                    ))}
                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const f = new FormData(form);
                      void run(async () => {
                        await save("hub_units", {
                          course_id: c.id,
                          title: field(f, "title"),
                          display_order: Number(field(f, "order")),
                        });
                        form.reset();
                      });
                    }}
                  >
                    <Field label="New unit title" name="title" required />
                    <Field
                      label="Order"
                      name="order"
                      type="number"
                      defaultValue="0"
                    />
                    <button
                      disabled={busy}
                      className="btn btn-primary self-end"
                    >
                      Add unit
                    </button>
                  </form>
                </article>
              ))}
            </>
          )}
          {tab === "Materials" && (
            <>
              <h2 className="mb-4 text-2xl font-bold">
                {editResource
                  ? "Edit / replace material"
                  : "Upload teaching material"}
              </h2>
              <form
                key={editResource?.id || "upload"}
                className="card grid gap-4 sm:grid-cols-2"
                onSubmit={resourceSubmit}
              >
                <Field
                  label="Title"
                  name="title"
                  required
                  maxLength={180}
                  defaultValue={editResource?.title}
                />
                <label>
                  Course
                  <select
                    required
                    name="course_id"
                    className="form-input"
                    value={uploadCourse}
                    onChange={(e) => setUploadCourse(e.target.value)}
                  >
                    <option value="">Choose course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Unit
                  <select
                    name="unit_id"
                    className="form-input"
                    defaultValue={editResource?.unit_id || ""}
                  >
                    <option value="">Course-wide</option>
                    {units
                      .filter((u) => u.course_id === uploadCourse)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Category
                  <select
                    name="category"
                    className="form-input"
                    defaultValue={editResource?.category}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2">
                  Description
                  <textarea
                    name="description"
                    className="form-input"
                    maxLength={5000}
                    defaultValue={editResource?.description}
                  />
                </label>
                <div
                  className="rounded-lg border-2 border-dashed border-line p-5 sm:col-span-2"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setFile(e.dataTransfer.files[0] || null);
                  }}
                >
                  <label className="grid gap-2 font-bold">
                    Drop a file here or choose a file
                    <input
                      type="file"
                      accept=".pdf,.txt,.c,.h,.cpp,.py,.java,.zip,.png,.jpg,.jpeg,.docx,.pptx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="mt-2 break-all text-sm text-muted">
                    {file?.name ||
                      editResource?.filename ||
                      "PDF, code/text, ZIP, PNG/JPEG, DOCX or PPTX · Maximum 20 MB"}
                  </p>
                  {file && (
                    <button
                      type="button"
                      className="btn btn-secondary mt-2"
                      onClick={() => setFile(null)}
                    >
                      Clear selected file
                    </button>
                  )}
                  {busy && file && (
                    <>
                      <progress
                        aria-label="Upload progress"
                        className="mt-3 w-full"
                        max={100}
                        value={progress}
                      />
                      <p>{progress}% uploaded · Saving metadata follows</p>
                    </>
                  )}
                </div>
                <Field
                  label="OR external reference (https://)"
                  name="external_url"
                  type="url"
                  defaultValue={editResource?.external_url || ""}
                />
                <Field
                  label="Tags (comma-separated)"
                  name="tags"
                  defaultValue={editResource?.tags.join(", ")}
                />
                <label>
                  Publication status
                  <select
                    className="form-input"
                    name="status"
                    defaultValue={editResource?.status || "draft"}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <Field
                  label="Release at (optional, local time)"
                  type="datetime-local"
                  name="release_at"
                  defaultValue={localDate(editResource?.release_at || null)}
                />
                <Field
                  label="Display order"
                  type="number"
                  name="display_order"
                  defaultValue={editResource?.display_order || 0}
                />
                <div className="grid">
                  <label>
                    <input
                      type="checkbox"
                      name="preview_enabled"
                      defaultChecked={editResource?.preview_enabled ?? true}
                    />{" "}
                    Enable preview
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="download_enabled"
                      defaultChecked={editResource?.download_enabled ?? true}
                    />{" "}
                    Show download action
                  </label>
                </div>
                <p className="text-sm text-muted sm:col-span-2">
                  Previewed files can still be saved or copied. A future release
                  time also protects solutions until that time.
                </p>
                <button disabled={busy} className="btn btn-primary">
                  {busy
                    ? "Saving…"
                    : editResource
                      ? "Save material"
                      : "Upload & save material"}
                </button>
                {editResource && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditResource(null);
                      setFile(null);
                      setUploadCourse("");
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </form>
              <h2 className="mb-3 mt-8 text-xl font-bold">Resource library</h2>
              {!resources.length && (
                <p>
                  No materials uploaded yet. Start with a verified syllabus and
                  your own lecture notes.
                </p>
              )}
              {resources.map((r) => (
                <article className="card mb-3" key={r.id}>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="text-sm text-muted">
                    {courses.find((c) => c.id === r.course_id)?.name} ·{" "}
                    {r.category} · {r.status}
                    {r.release_at
                      ? " · Release " + new Date(r.release_at).toLocaleString()
                      : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditResource(r);
                        setUploadCourse(r.course_id);
                        setFile(null);
                        window.scrollTo({ top: 0 });
                      }}
                    >
                      Edit / replace
                    </button>
                    <button
                      disabled={busy}
                      className="btn btn-secondary"
                      onClick={() =>
                        void run(() =>
                          save("hub_resources", {
                            ...r,
                            status:
                              r.status === "published" ? "draft" : "published",
                            updated_at: new Date().toISOString(),
                          }),
                        )
                      }
                    >
                      {r.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      disabled={busy}
                      className="btn btn-secondary"
                      onClick={() => {
                        if (
                          confirm(
                            "Archive this material? Students will lose access.",
                          )
                        )
                          void run(() =>
                            save("hub_resources", {
                              ...r,
                              status: "archived",
                              updated_at: new Date().toISOString(),
                            }),
                          );
                      }}
                    >
                      Archive
                    </button>
                  </div>
                </article>
              ))}
            </>
          )}
          {tab === "Announcements" && (
            <>
              <h2 className="mb-4 text-2xl font-bold">Create announcement</h2>
              <form
                className="card grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const f = new FormData(form);
                  void run(async () => {
                    await save("hub_announcements", {
                      title: field(f, "title"),
                      body: field(f, "body"),
                      course_id: field(f, "course_id") || null,
                      is_public: f.get("is_public") === "on",
                      published: f.get("published") === "on",
                    });
                    form.reset();
                  });
                }}
              >
                <Field label="Title" name="title" required maxLength={180} />
                <label>
                  Message
                  <textarea
                    name="body"
                    required
                    maxLength={5000}
                    className="form-input"
                  />
                </label>
                <label>
                  Course
                  <select name="course_id" className="form-input">
                    <option value="">Public announcement only</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <input name="is_public" type="checkbox" /> Explicitly make
                  this announcement public
                </label>
                <label>
                  <input name="published" type="checkbox" /> Publish now
                </label>
                <button disabled={busy} className="btn btn-primary">
                  Save announcement
                </button>
              </form>
              {announcements.map((a) => (
                <article className="card mt-3" key={a.id}>
                  <h3>{a.title}</h3>
                  <button
                    disabled={busy}
                    className="btn btn-secondary mt-2"
                    onClick={() =>
                      void run(async () => {
                        const r = await supabase!
                          .from("hub_announcements")
                          .update({ published: !a.published })
                          .eq("id", a.id);
                        if (r.error) throw Error(r.error.message);
                      })
                    }
                  >
                    {a.published ? "Unpublish" : "Publish"}
                  </button>
                </article>
              ))}
            </>
          )}
          {tab === "Audit trail" && (
            <>
              <h2 className="mb-4 text-2xl font-bold">
                Recent administrative activity
              </h2>
              <p className="mb-4 text-sm text-muted">
                Latest 100 events. Credentials and file URLs are never recorded
                here.
              </p>
              {audit.map((a) => (
                <article
                  className="border-b border-line py-3 text-sm"
                  key={a.id}
                >
                  <strong>{a.action}</strong> · {a.entity}
                  <span className="block text-muted">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </article>
              ))}
              {!audit.length && <p>No events recorded yet.</p>}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input className="form-input" {...props} />
    </label>
  );
}
