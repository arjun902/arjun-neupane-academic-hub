import { Catalogue } from '@/components/catalogue';
export const metadata={title:'Course catalogue',robots:{index:false,follow:false}};
export function generateStaticParams(){return ['bca','csit','be'].map(slug=>({slug}));}
export default function LegacyProgramme(){return <main><Catalogue/></main>;}
