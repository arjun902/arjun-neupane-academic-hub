"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, UserRound } from "lucide-react";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const [status, setStatus] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    if (!isSupabaseConfigured || !supabase) {
      setStatus("Supabase env vars are not configured yet. This login screen is ready for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatus(error ? error.message : "Logged in successfully.");
  }

  return (
    <main className="site-container grid min-h-[calc(100vh-76px)] items-center gap-10 py-14 lg:grid-cols-[0.85fr_0.6fr]">
      <section>
        <p className="eyebrow">Secure academic access</p>
        <h1 className="h1">Login to the academic platform.</h1>
        <p className="lead mt-5">
          Students can access enrolled subjects, downloads, grading updates, feedback, notices, project guidelines, and
          academic query support.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Role title="Student" body="Download notes, submit assignments, and check feedback." />
          <Role title="Teacher" body="Publish materials, update grading, and post notices." />
          <Role title="Admin" body="Manage students, subjects, analytics, and resource workflows." />
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-7 shadow-premium">
        <p className="eyebrow">Login / Register</p>
        <h2 className="h2">Welcome back</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Email
            <input className="form-input" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Password
            <input className="form-input" name="password" type="password" required />
          </label>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            Role
            <select className="form-input" name="role">
              <option>Student</option>
              <option>Teacher</option>
              <option>Admin</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit"><LogIn size={18} /> Continue</button>
          <Link className="btn btn-secondary" href="/student"><UserRound size={18} /> Preview student dashboard</Link>
          <Link className="btn btn-secondary" href="/admin"><LayoutDashboard size={18} /> Preview admin dashboard</Link>
          {status ? <p className="text-sm text-teal-deep">{status}</p> : null}
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
