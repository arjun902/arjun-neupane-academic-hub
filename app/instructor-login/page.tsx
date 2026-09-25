"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthenticatedProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
export default function InstructorLogin() {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  return (
    <main id="main-content" className="site-container py-12">
      <section className="mx-auto max-w-lg rounded-lg border border-line bg-white p-7 shadow-soft">
        <p className="eyebrow">Instructor workspace</p>
        <h1 className="h2">Instructor Login</h1>
        <p className="my-4 text-muted">
          Use your administrator account to manage course passwords and publish
          materials.
        </p>
        <aside className="mb-6 rounded-lg border border-teal/20 bg-teal/5 p-4">
          <h2 className="font-bold text-navy">Here for course materials?</h2>
          <p className="mt-1 text-sm text-muted">
            Students only need the course password from their instructor. No
            email, email verification or registration is required.
          </p>
          <Link className="btn btn-primary mt-3" href="/courses">
            Access My Courses
          </Link>
        </aside>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!supabase) {
              setStatus("Instructor access is not configured yet.");
              return;
            }
            const f = new FormData(e.currentTarget);
            setBusy(true);
            setStatus("");
            try {
              const r = await supabase.auth.signInWithPassword({
                email: String(f.get("email") || ""),
                password: String(f.get("password") || ""),
              });
              if (r.error)
                throw Error("Check your email and password, then try again.");
              const { profile } = await getAuthenticatedProfile();
              if (profile.role !== "admin") {
                await supabase.auth.signOut();
                throw Error(
                  "This page is for instructors. Students can access courses from the catalogue.",
                );
              }
              router.replace("/admin");
              router.refresh();
            } catch (e) {
              setStatus((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="grid gap-1 text-sm font-bold">
            Administrator email
            <input
              name="email"
              type="email"
              autoComplete="username"
              className="form-input"
              required
              maxLength={254}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Administrator password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="form-input"
              required
            />
          </label>
          <button disabled={busy} className="btn btn-primary">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p role="status">{status}</p>
          <p className="text-sm text-muted">
            Forgot your administrator password? Use your established
            administrator recovery process.
          </p>
        </form>
      </section>
    </main>
  );
}
