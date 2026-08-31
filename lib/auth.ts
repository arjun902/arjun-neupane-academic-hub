import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "teacher" | "student";

export type UserProfile = {
  id: string;
  full_name: string;
  role: UserRole;
  program: string | null;
  semester: string | null;
};

export async function getAuthenticatedProfile(): Promise<{ user: User; profile: UserProfile }> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You are not signed in.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, program, semester")
    .eq("id", userData.user.id)
    .single<UserProfile>();

  if (profileError || !profile) throw new Error("Your account profile has not been provisioned.");
  return { user: userData.user, profile };
}

export function dashboardForRole(role: UserRole) {
  return role === "student" ? "/student" : "/admin";
}
