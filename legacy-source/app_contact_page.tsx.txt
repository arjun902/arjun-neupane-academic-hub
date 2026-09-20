import type { Metadata } from "next";
import { ExternalLink, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { profile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Er. Arjun Neupane about a course, workshop, student project, research activity, or institutional invitation."
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  return (
    <main>
      <PageHero breadcrumb="Home / Contact" title="Get in touch">
        Contact me about a course, workshop, student project, research activity, or invitation from your institution.
      </PageHero>
      <section className="section">
        <div className="site-container grid items-start gap-6 lg:grid-cols-[0.75fr_1fr]">
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="eyebrow">Contact details</p>
            <h2 className="h2">Choose the most convenient way to reach me.</h2>
            <ul className="mt-6 grid gap-4">
              <li className="flex gap-3 text-slate-700"><Mail className="text-teal-deep" size={20} /> {contactEmail ? <a className="font-bold text-teal-deep" href={`mailto:${contactEmail}`}>{contactEmail}</a> : "Send a message using the form or LinkedIn"}</li>
              {contactPhone ? <li className="flex gap-3 text-slate-700"><Phone className="text-teal-deep" size={20} /> <a className="font-bold text-teal-deep" href={`tel:${contactPhone}`}>{contactPhone}</a></li> : null}
              <li className="flex gap-3 text-slate-700"><MapPin className="text-teal-deep" size={20} /> Kathmandu, Nepal</li>
              <li className="flex gap-3 text-slate-700">
                <Linkedin className="text-teal-deep" size={20} />
                <span>
                  LinkedIn:{" "}
                  <a className="font-bold text-teal-deep hover:text-navy" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                    er-arjun-neupane
                    <ExternalLink className="ml-1 inline" size={14} />
                  </a>
                </span>
              </li>
            </ul>
          </aside>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
