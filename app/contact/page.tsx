import { profile } from "@/lib/data";
export const metadata = { title: "Contact your instructor" };
export default function Contact() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <main id="main-content" className="site-container py-12">
      <section className="card max-w-2xl">
        <p className="eyebrow">Instructor assistance</p>
        <h1 className="h2">Get in touch</h1>
        <p className="mt-5 text-muted">
          For a new account, a password reset, or a change to your course
          access, contact Er. Arjun Neupane through your established class
          channel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {email && (
            <a href={"mailto:" + email} className="btn btn-primary">
              Email the instructor
            </a>
          )}
          <a
            className="btn btn-secondary"
            href={profile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
          <a
            className="btn btn-secondary"
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
        <p className="mt-5 text-sm text-muted">
          Never share your current password. Your instructor can issue a new
          temporary password if needed.
        </p>
      </section>
    </main>
  );
}
