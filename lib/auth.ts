import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
export type UserRole = "admin" | "teacher" | "student";
export type UserProfile = {
  id: string;
  full_name: string;
  role: UserRole;
  program: string | null;
  semester: string | null;
  must_change_password: boolean;
  status: string;
  expires_at: string | null;
};
export async function getAuthenticatedProfile(): Promise<{
  user: User;
  profile: UserProfile;
}> {
  if (!supabase) throw Error("Portal not configured");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw Error("Sign in required");
  const result = await supabase
    .from("hub_accounts")
    .select("*")
    .eq("id", data.user.id)
    .single();
  if (result.error || !result.data) throw Error("Account unavailable");
  return { user: data.user, profile: result.data as UserProfile };
}
export function dashboardForRole(role: UserRole) {
  return role === "admin" ? "/admin" : "/student";
}
export async function adminAction(body: Record<string, unknown>) {
  if (!supabase) throw Error("Portal unavailable");
  const { data, error } = await supabase.functions.invoke("portal-admin", {
    body,
  });
  if (error) {
    let message =
      "Request failed. Check your connection and access, then retry.";
    try {
      const detail = await error.context?.json();
      if (detail?.error) message = detail.error;
    } catch {}
    throw Error(message);
  }
  if (data?.error) throw Error(data.error);
  return data;
}
