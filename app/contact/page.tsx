import type { Metadata } from "next";
import { ExternalLink, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { profile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Er. Arjun Neupane for student support, training, collaboration, research mentoring, college invitations and academic resources."
};

export default function ContactPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Contact" title="Contact for Student Support, Training, Research, and Collaboration">
        For academic support, workshops, research mentorship, project guidance, or college invitations in Kathmandu and beyond.
      </PageHero>
      <section className="section">
        <div className="site-container grid items-start gap-6 lg:grid-cols-[0.75fr_1fr]">
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="eyebrow">Contact details</p>
            <h2 className="h2">Let the message reach the right academic workflow.</h2>
            <ul className="mt-6 grid gap-4">
              <li className="flex gap-3 text-slate-700"><Mail className="text-teal-deep" size={20} /> Email: [ADD EMAIL HERE]</li>
              <li className="flex gap-3 text-slate-700"><Phone className="text-teal-deep" size={20} /> Phone: [ADD PHONE NUMBER HERE]</li>
              <li className="flex gap-3 text-slate-700"><MapPin className="text-teal-deep" size={20} /> Location: Kathmandu, Nepal</li>
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
