"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [purpose, setPurpose] = useState("Student Support");
  const startedAt = useRef(Date.now());
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  useEffect(() => {
    const requestedPurpose = new URLSearchParams(window.location.search).get("purpose");
    if (["Student Support", "Training", "Collaboration", "Research", "College Invitation"].includes(requestedPurpose || "")) {
      setPurpose(requestedPurpose as string);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (String(values.get("website") || "")) return;
    if (Date.now() - startedAt.current < 2500) {
      setMessage("Please take a moment to review your message, then submit it again.");
      return;
    }

    const payload = {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      program: String(values.get("program") || "").trim(),
      purpose: String(values.get("purpose") || "").trim(),
      subject: String(values.get("subject") || "").trim(),
      message: String(values.get("message") || "").trim(),
      website: ""
    };

    setSubmitting(true);
    setMessage("");
    if (isSupabaseConfigured && supabase) {
      const result = await supabase.from("contact_messages").insert(payload);
      setSubmitting(false);
      if (result.error) {
        setMessage("I could not send your message just now. Please contact me through LinkedIn instead.");
        return;
      }
      form.reset();
      setPurpose("Student Support");
      startedAt.current = Date.now();
      setMessage("Thank you. Your message has been sent.");
      return;
    }

    const body = `${payload.message}\n\nFrom: ${payload.name} (${payload.email})\nProgram: ${payload.program}\nPurpose: ${payload.purpose}`;
    if (contactEmail) {
      window.location.href = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
      setSubmitting(false);
      setMessage("Your email app has opened with the message ready to send.");
      return;
    }

    try { await navigator.clipboard.writeText(`${payload.subject}\n\n${body}`); } catch { /* LinkedIn remains available as the fallback. */ }
    setSubmitting(false);
    setMessage("Online submission is unavailable at the moment. Please send your enquiry through LinkedIn.");
  }

  return (
    <form
      className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft"
      onSubmit={handleSubmit}
    >
      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        <Field label="Your name">
          <input required className="form-input" name="name" autoComplete="name" minLength={2} maxLength={120} />
        </Field>
        <Field label="Email address">
          <input required className="form-input" name="email" type="email" autoComplete="email" maxLength={254} />
        </Field>
        <Field label="Program or organisation">
          <select className="form-input" name="program">
            <option>BCA</option>
            <option>CSIT</option>
            <option>BE</option>
            <option>College / Organisation</option>
            <option>Research collaborator</option>
          </select>
        </Field>
        <Field label="Reason for contacting">
          <select className="form-input" name="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)}>
            <option value="Student Support">Academic question</option>
            <option value="Training">Workshop or training</option>
            <option value="Collaboration">Teaching collaboration</option>
            <option value="Research">Research collaboration</option>
            <option value="College Invitation">College invitation</option>
          </select>
        </Field>
        <Field label="Topic" wide>
          <input required className="form-input" name="subject" minLength={3} maxLength={180} />
        </Field>
        <Field label="Message" wide>
          <textarea required className="form-input min-h-32 resize-y" name="message" minLength={10} maxLength={5000} />
        </Field>
        <label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="flex items-start gap-2 text-sm text-muted"><input className="mt-1" type="checkbox" required /> I agree that these details may be used to reply to my enquiry.</label>
      <button className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
        <Send size={18} />
        {submitting ? "Sending..." : "Send enquiry"}
      </button>
      {message ? <p role="status" aria-live="polite" className="text-sm font-bold text-teal-deep">{message} {!isSupabaseConfigured && !contactEmail ? <a className="underline" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">Open LinkedIn</a> : null}</p> : null}
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
