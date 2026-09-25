import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { asset } from "@/content/site";
import { PageShell } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Academic profile",
  profile.summary,
  "/profile",
);
export default function Profile() {
  return (
    <PageShell
      eyebrow="Academic profile"
      title={profile.name}
      description={profile.headline}
    >
      <div className="profile-layout">
        <div>
          <Image
            src={asset(profile.photo)}
            width={260}
            height={325}
            alt="Arjun Neupane"
          />
          <p className="mt-4 text-sm text-muted">{profile.location}</p>
          <Link href="/contact" className="text-link">
            Get in touch →
          </Link>
        </div>
        <div className="prose">
          <h2>Teaching, practice & inquiry</h2>
          <p>{profile.summary}</p>
          <h2>Academic background</h2>
          <ul>
            {profile.education.map((e) => (
              <li key={e.description}>{e.description}</li>
            ))}
          </ul>
          <h2>Teaching experience</h2>
          <p>
            Teaching and academic mentoring roles recorded in this site’s
            profile.
          </p>
          {profile.experience.map((e) => (
            <article className="border-t border-line py-5" key={e.institution}>
              <h3>{e.institution}</h3>
              <p className="font-semibold text-teal">{e.role}</p>
              <p>{e.focus}</p>
            </article>
          ))}
          <h2>Approach to learning</h2>
          <p>
            Connect concepts with implementation, use laboratory work to test
            understanding, and support students in explaining their decisions
            and evidence.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/teaching">
              Teaching collections
            </Link>
            <Link className="text-link" href="/research">
              Research interests →
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
