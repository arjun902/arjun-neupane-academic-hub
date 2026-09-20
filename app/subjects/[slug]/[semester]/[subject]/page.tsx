import { allOfferings } from '@/lib/academics';
import Link from 'next/link';
export const metadata={title:'Course resources moved',robots:{index:false,follow:false}};
export function generateStaticParams(){return allOfferings.map(o=>({slug:o.programSlug,semester:'semester-'+o.semesterNumber,subject:o.slug}));}
export default function LegacyCourse(){return <main className="site-container py-16"><h1 className="h2">Your learning materials have moved</h1><p className="my-5">Sign in to find the courses assigned to your account.</p><Link className="btn btn-primary" href="/student">Open student portal</Link></main>;}
