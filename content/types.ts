export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  navigation: readonly (readonly [string, string])[];
}
export interface EducationRecord {
  description: string;
}
export interface ExperienceRecord {
  institution: string;
  role: string;
  focus: string;
}
export interface ExternalProfile {
  label: string;
  url: string;
}
export interface Profile {
  name: string;
  headline: string;
  location: string;
  summary: string;
  photo: string;
  education: EducationRecord[];
  experience: ExperienceRecord[];
  links: ExternalProfile[];
}
export interface Semester {
  number: number;
  courseIds: string[];
}
export interface AcademicProgram {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  semesters: Semester[];
}
export interface CourseUnit {
  id: string;
  title: string;
  topics: string[];
}
export interface Course {
  slug: string;
  name: string;
  summary: string;
  practical: boolean;
  units: CourseUnit[];
}
export type ResourceType =
  | "Reference"
  | "Notes"
  | "Slides"
  | "Lab"
  | "Assignment"
  | "Past questions"
  | "Syllabus"
  | "Sample code";
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  subject: string;
  unit?: string;
  programs?: string[];
  semesters?: number[];
  date?: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  status: "published" | "draft";
  credit?: string;
}
export interface ResearchInterest {
  title: string;
  description: string;
}
export interface ResearchProject {
  title: string;
  description: string;
  status: string;
  url?: string;
}
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  type: "Journal article" | "Conference paper" | "Book chapter" | "Preprint";
  topics: string[];
}
export interface Notice {
  id: string;
  title: string;
  date: string;
  category: string;
  body: string;
  link?: string;
}
export interface Activity {
  title: string;
  category: string;
  description: string;
  date?: string;
  status: "offering" | "completed" | "scheduled";
}
