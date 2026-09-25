"use client";
import { useEffect, useState } from "react";
import { adminAction } from "@/lib/auth";
import type { Course } from "@/lib/portal";
type Config = {
  course_id: string;
  enabled: boolean;
  expires_at: string | null;
  standard_minutes: number;
  remembered_minutes: number;
  password_set: boolean;
  access_version: number;
};
export function CoursePasswordAdmin({ courses }: { courses: Course[] }) {
  const [configs, setConfigs] = useState<Config[]>([]),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState<{
    course: string;
    password: string;
  } | null>(null);
  async function refresh() {
    const r = await adminAction({ action: "course-access-list" });
    setConfigs(r.courses);
  }
  useEffect(() => {
    void refresh().catch(() =>
      setStatus(
        "Course access settings could not load. Apply the course-access migration and deploy the updated functions.",
      ),
    );
  }, []);
  async function run(body: Record<string, unknown>, course: string) {
    setBusy(true);
    setStatus("");
    setGenerated(null);
    try {
      const r = await adminAction(body);
      if (r.generated_password)
        setGenerated({ course, password: r.generated_password });
      await refresh();
      setStatus("Saved. Previous sessions for this course have been revoked.");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2 className="text-2xl font-bold">Course passwords & access</h2>
      <p className="my-3 text-muted">
        Give each class its course password yourself. Anyone with it can access
        that course; it does not identify a student or let you block one person.
        Keep personal records and submissions out of this library.
      </p>
      <p className="mb-5 text-sm text-muted">
        Passwords cannot be retrieved. Settings changes, rotation and revocation
        end existing sessions. Files already downloaded cannot be withdrawn;
        issued file links can remain usable for up to 60 seconds.
      </p>
      <p role="status" className="my-4">
        {status}
      </p>
      {generated && (
        <div
          className="mb-6 rounded-lg border-2 border-teal bg-white p-5"
          role="region"
          aria-label="New course password"
        >
          <h3 className="font-bold">New password for {generated.course}</h3>
          <code className="my-3 block break-all bg-slate-50 p-3">
            {generated.password}
          </code>
          <p className="text-sm">
            Copy it now and distribute it through your class channel. It is only
            shown here and is discarded when you leave this panel.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(generated.password);
                  setStatus(
                    "Password copied. Clear your clipboard after distributing it.",
                  );
                } catch {
                  setStatus(
                    "Clipboard unavailable. Select and copy the password above.",
                  );
                }
              }}
            >
              Copy password
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setGenerated(null)}
            >
              Discard displayed password
            </button>
          </div>
        </div>
      )}
      {courses.map((c) => {
        const cfg = configs.find((x) => x.course_id === c.id);
        return (
          <article key={c.id} className="card mb-5">
            <h3 className="text-xl font-bold">
              {c.name} <span className="pill">{c.program}</span>
            </h3>
            {!cfg ? (
              <p className="mt-3">Settings unavailable.</p>
            ) : (
              <>
                <p className="my-3 text-sm">
                  {cfg.password_set
                    ? "Password set (not retrievable)"
                    : "No password set"}{" "}
                  · {cfg.enabled ? "Access enabled" : "Access disabled"}
                </p>
                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const value = new FormData(form).get("password");
                    if (
                      !confirm(
                        "Replace this course password? All students will need the new password, and all existing sessions will be revoked.",
                      )
                    )
                      return;
                    void run(
                      {
                        action: "course-password",
                        course_id: c.id,
                        password: value,
                      },
                      c.name,
                    );
                    form.reset();
                  }}
                >
                  <label className="grid gap-1 text-sm font-bold">
                    Set or replace password
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      maxLength={72}
                      aria-describedby={`password-help-${c.id}`}
                    />
                  </label>
                  <p
                    id={`password-help-${c.id}`}
                    className="text-xs text-muted"
                  >
                    At least 12 characters; maximum 72 UTF-8 bytes. Pasting and
                    password managers are supported.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={busy} className="btn btn-primary">
                      Set password
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="btn btn-secondary"
                      onClick={() => {
                        if (
                          confirm(
                            "Generate a replacement password? All students will need the new password, and all existing sessions will be revoked.",
                          )
                        )
                          void run(
                            {
                              action: "course-password",
                              course_id: c.id,
                              generate: true,
                            },
                            c.name,
                          );
                      }}
                    >
                      Generate strong password
                    </button>
                  </div>
                </form>
                <form
                  key={cfg.access_version}
                  className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    if (
                      !confirm(
                        "Save access settings and revoke existing sessions for this course?",
                      )
                    )
                      return;
                    const date = String(f.get("expires_at") || "");
                    void run(
                      {
                        action: "course-access-update",
                        course_id: c.id,
                        enabled: f.has("enabled"),
                        expires_at: date ? new Date(date).toISOString() : null,
                        standard_minutes: Number(f.get("standard")),
                        remembered_minutes: Number(f.get("remembered")),
                      },
                      c.name,
                    );
                  }}
                >
                  <label className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      name="enabled"
                      defaultChecked={cfg.enabled}
                    />{" "}
                    Enable course access
                  </label>
                  <label className="grid gap-1 text-sm">
                    Optional expiry (local time)
                    <input
                      className="form-input"
                      type="datetime-local"
                      name="expires_at"
                      defaultValue={
                        cfg.expires_at
                          ? new Date(
                              Date.parse(cfg.expires_at) -
                                new Date(cfg.expires_at).getTimezoneOffset() *
                                  60000,
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Standard session (minutes, up to 8 hours)
                    <input
                      className="form-input"
                      type="number"
                      name="standard"
                      min={15}
                      max={480}
                      required
                      defaultValue={cfg.standard_minutes}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Remembered session (minutes, up to 7 days)
                    <input
                      className="form-input"
                      type="number"
                      name="remembered"
                      min={60}
                      max={10080}
                      required
                      defaultValue={cfg.remembered_minutes}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 self-end">
                    <button disabled={busy} className="btn btn-primary">
                      Save settings
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="btn btn-secondary"
                      onClick={() => {
                        if (
                          confirm(
                            "Revoke all sessions for this course? The current password will still unlock new sessions. Rotate it if access should be withdrawn.",
                          )
                        )
                          void run(
                            { action: "course-revoke", course_id: c.id },
                            c.name,
                          );
                      }}
                    >
                      Revoke all sessions
                    </button>
                  </div>
                </form>
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}
