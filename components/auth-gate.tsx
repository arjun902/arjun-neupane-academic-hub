"use client";

import Link from "next/link";
import { LockKeyhole, LogOut, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthenticatedProfile, type UserProfile, type UserRole } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function AuthGate({
  roles,
  children
}: {
  roles: UserRole[];
  children: React.ReactNode | ((profile: UserProfile) => React.ReactNode);
}) {
  const rolesKey = roles.join(",");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "forbidden" | "unconfigured">("loading");

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setState("unconfigured");
        return;
      }

      try {
        const result = await getAuthenticatedProfile();
        if (!active) return;
        if (!roles.includes(result.profile.role)) {
          setState("forbidden");
          return;
        }
        setProfile(result.profile);
        setState("ready");
      } catch {
        if (active) setState("signed-out");
      }
    }

    void verifyAccess();
    const listener = supabase?.auth.onAuthStateChange(() => {
      window.setTimeout(() => void verifyAccess(), 0);
    });
    return () => {
      active = false;
      listener?.data.subscription.unsubscribe();
    };
  }, [rolesKey]);

  async function signOut() {
    await supabase?.auth.signOut();
    setProfile(null);
    setState("signed-out");
  }

  if (state === "loading") return <AccessPanel icon={LockKeyhole} title="Checking access">Please wait while we verify your session.</AccessPanel>;
  if (state === "unconfigured") {
    return (
      <AccessPanel icon={ShieldAlert} title="Portal unavailable">
        Online account access is not available at the moment. Please contact the site administrator.
      </AccessPanel>
    );
  }
  if (state === "signed-out") {
    return (
      <AccessPanel icon={LockKeyhole} title="Login required">
        This page is available only to signed-in students and staff. <Link className="font-extrabold text-teal-deep" href="/login">Sign in</Link> to continue.
      </AccessPanel>
    );
  }
  if (state === "forbidden") {
    return <AccessPanel icon={ShieldAlert} title="Access denied">Your account does not have permission to open this dashboard.</AccessPanel>;
  }

  return (
    <>
      <div className="site-container flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white py-3 text-sm">
        <span>Signed in as <strong>{profile?.full_name}</strong> · {profile?.role}</span>
        <button className="btn btn-secondary" type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
      </div>
      {profile && typeof children === "function" ? children(profile) : children}
    </>
  );
}

function AccessPanel({
  icon: Icon,
  title,
  children
}: {
  icon: typeof LockKeyhole;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="site-container grid min-h-[60vh] place-items-center py-16">
      <section className="max-w-xl rounded-lg border border-line bg-white p-8 text-center shadow-premium">
        <span className="icon-box"><Icon size={22} /></span>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-3 text-muted">{children}</p>
      </section>
    </main>
  );
}
