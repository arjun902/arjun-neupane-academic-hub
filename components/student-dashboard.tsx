// Compatibility entry for integrations using the former student dashboard.
import Link from "next/link";
import { Catalogue } from "@/components/catalogue";
export function SecureStudentDashboard() {
  return (
    <main id="main-content">
      <div className="site-container pt-10">
        <h1 className="h2">Access My Courses</h1>
        <p className="mt-4">
          Choose your course and enter the password provided by your instructor.
        </p>
        <Link
          className="mt-3 inline-block text-teal-deep underline"
          href="/instructor-login"
        >
          Instructor Login
        </Link>
      </div>
      <Catalogue />
    </main>
  );
}
