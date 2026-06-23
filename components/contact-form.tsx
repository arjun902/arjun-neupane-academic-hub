"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState("");

  return (
    <form
      className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("Demo submitted. Connect this form to Supabase Edge Functions or email once credentials are ready.");
      }}
    >
      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        <Field label="Name">
          <input required className="form-input" />
        </Field>
        <Field label="Email">
          <input required className="form-input" type="email" />
        </Field>
        <Field label="Program">
          <select className="form-input">
            <option>BCA</option>
            <option>CSIT</option>
            <option>BE</option>
            <option>College / Organization</option>
            <option>Research collaborator</option>
          </select>
        </Field>
        <Field label="Purpose">
          <select className="form-input">
            <option>Student Support</option>
            <option>Training</option>
            <option>Collaboration</option>
            <option>Research</option>
            <option>College Invitation</option>
          </select>
        </Field>
        <Field label="Subject" wide>
          <input required className="form-input" />
        </Field>
        <Field label="Message" wide>
          <textarea required className="form-input min-h-32 resize-y" />
        </Field>
      </div>
      <button className="btn btn-primary" type="submit">
        <Send size={18} />
        Send message
      </button>
      {message ? <p className="text-sm text-teal-deep">{message}</p> : null}
    </form>
  );
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`grid gap-2 text-sm font-extrabold text-slate-700 ${wide ? "md:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
