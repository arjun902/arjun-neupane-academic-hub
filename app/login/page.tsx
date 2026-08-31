"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dashboardForRole, getAuthenticatedProfile } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    if (!isSupabaseConfigured || !supabase) {
      setStatus("Online sign-in is unavailable at the moment. Please try again later or contact the administrator.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("We could not sign you in. Check your email and password, then try again.");
      setSubmitting(false);
      return;
    }

    try {
      const { profile } = await getAuthenticatedProfile();
      router.replace(dashboardForRole(profile.role));
      router.refresh();
    } catch {
      await supabase.auth.signOut();
      setStatus("This account has not been assigned a student or staff profile. Please contact the administrator.");
      setSubmitting(false);
    }
  }

  return (
    <main className="site-container grid min-h-[calc(100vh-76px)] items-center gap-10 py-14 lg:grid-cols-[0.85fr_0.6fr]">
      <section>
        <p className="eyebrow">Student and staff portal</p>
        <h1 className="h1">Sign in to your academic account</h1>
        <p className="lead mt-5">
          Use your assigned account to find course files, submit work, review assessment feedback and read notices relevant
          to your studies or teaching.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Role title="Students" body="Download course files, submit assignments and review feedback." />
          <Role title="Teachers" body="Publish resources, record assessments and share notices." />
          <Role title="Administrators" body="Manage the academic catalog, accounts, submissions and enquiries." />
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-7 shadow-premium">
        <p className="eyebrow">Account sign-in</p>
        <h2 className="h2">Welcome back</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Email
            <input className="form-input" name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Password
            <input className="form-input" name="password" type="password" autoComplete="current-password" minLength={8} required />
          </label>
          <button className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
            <LogIn size={18} /> {submitting ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-sm text-muted"><UserRound className="mr-1 inline" size={16} />You will be directed to the dashboard assigned to your account.</p>
          <p className="text-sm text-muted"><LayoutDashboard className="mr-1 inline" size={16} />If the wrong dashboard opens, ask the administrator to check your profile.</p>
          {status ? <p role="status" aria-live="polite" className="text-sm font-bold text-teal-deep">{status}</p> : null}
        </form>
      </section>
    </main>
  );
}

function Role({ title, body }: { title: string; body: string }) {
  return (
    <article className="card">
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted">{body}</p>
    </article>
  );
}
