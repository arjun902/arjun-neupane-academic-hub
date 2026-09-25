import { offerings, courseResources } from "./content";
export interface SearchFilters {
  query: string;
  program: string;
  semester: string;
  subject: string;
  type: string;
}
export function filterOfferings(items: typeof offerings, f: SearchFilters) {
  const terms = f.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((o) => {
    if (
      (f.program && o.program.slug !== f.program) ||
      (f.semester && String(o.semester) !== f.semester) ||
      (f.subject && o.course.slug !== f.subject)
    )
      return false;
    const rs = courseResources(
      o.course.slug,
      o.program.slug,
      o.semester,
    ).filter((r) => !f.type || r.type === f.type);
    if (f.type && !rs.length) return false;
    const text = [
      o.course.name,
      o.course.summary,
      o.program.name,
      o.program.shortName,
      ...o.course.units.flatMap((u) => [u.title, ...u.topics]),
      ...rs.flatMap((r) => [r.title, r.description, ...r.tags]),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return terms.every((t) => text.includes(t));
  });
}
