"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  getAuthenticatedProfile,
  adminAction,
  type UserProfile,
  type UserRole,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
export function AuthGate({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode | ((profile: UserProfile) => React.ReactNode);
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null),
    [state, setState] = useState("loading"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const authOperation = useRef(false);
  const checkVersion = useRef(0);
  const key = roles.join(",");
  useEffect(() => {
    let alive = true;
    async function check() {
      if (authOperation.current) return;
      const version = ++checkVersion.current;
      if (!supabase) {
        setState("unconfigured");
        return;
      }
      try {
        const { profile: p } = await getAuthenticatedProfile();
        if (!alive || authOperation.current || version !== checkVersion.current)
          return;
        setProfile(p);
        setState(
          p.status !== "active" ||
            (p.expires_at && Date.parse(p.expires_at) <= Date.now())
            ? "denied"
            : !roles.includes(p.role)
              ? "denied"
              : p.must_change_password
                ? "password"
                : "ready",
        );
      } catch {
        if (
          alive &&
          !authOperation.current &&
          version === checkVersion.current
        ) {
          setProfile(null);
          setState("signed-out");
        }
      }
    }
    void check();
    const sub = supabase?.auth.onAuthStateChange(() =>
      window.setTimeout(() => void check(), 0),
    );
    const timer = window.setInterval(() => void check(), 30000);
    return () => {
      alive = false;
      clearInterval(timer);
      sub?.data.subscription.unsubscribe();
    };
  }, [key]);
  async function signOut(successMessage = "You have signed out.") {
    authOperation.current = true;
    checkVersion.current += 1;
    setBusy(true);
    setState("signing-out");
    setMessage("");
    try {
      const result = await supabase?.auth.signOut();
      if (result?.error) throw result.error;
      setProfile(null);
      setState("signed-out");
      setMessage(successMessage);
      authOperation.current = false;
    } catch {
      // The SDK can retain its session on a network error. Keep the portal
      // closed and polling paused until sign-out can actually complete.
      setState("signout-error");
      setMessage(
        "Sign-out could not complete. Your session is still on this device. Reconnect and retry sign-out.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (state === "loading")
    return (
      <main className="site-container py-16" aria-busy="true">
        Checking your account…
      </main>
    );
  if (state === "password")
    return (
      <main className="site-container max-w-xl py-12">
        <p className="eyebrow">Secure your account</p>
        <h1 className="h2">Choose your own password</h1>
        <p className="my-4">
          Replace the temporary password before opening your courses. Use at
          least 12 characters.
        </p>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (f.get("password") !== f.get("confirm")) {
              setMessage("Passwords do not match.");
              return;
            }
            setBusy(true);
            authOperation.current = true;
            checkVersion.current += 1;
            try {
              await adminAction({
                action: "change-password",
                current_password: f.get("current"),
                password: f.get("password"),
              });
              await signOut(
                "Password changed. Sign in with your new password.",
              );
            } catch (err) {
              authOperation.current = false;
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Temporary password
            <input
              className="form-input"
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            New password
            <input
              className="form-input"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              className="form-input"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save new password"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="btn btn-secondary"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
          <p role="status">{message}</p>
        </form>
      </main>
    );
  if (state !== "ready")
    return (
      <main className="site-container grid min-h-[55vh] place-items-center py-12">
        <section className="card max-w-lg">
          <p className="eyebrow">Student learning portal</p>
          <h1 className="h2">
            {state === "unconfigured"
              ? "Portal unavailable"
              : state === "signing-out"
                ? "Signing out…"
                : state === "signout-error"
                  ? "Sign-out incomplete"
                  : state === "denied"
                    ? "Access unavailable"
                    : "Welcome to your learning space"}
          </h1>
          <p className="my-5 text-muted">
            {state === "unconfigured"
              ? "Account access has not been configured yet. Please contact your instructor."
              : state === "signing-out" || state === "signout-error"
                ? "Your learning space is closed while sign-out completes."
                : state === "denied"
                  ? "Your account is suspended, expired, or not permitted here. Ask your instructor for assistance."
                  : "Sign in with your individual account to open your assigned courses."}
          </p>
          <p role="status">{message}</p>
          {state !== "signing-out" && state !== "signout-error" && (
            <Link className="btn btn-primary" href="/login">
              Student Login
            </Link>
          )}
          {profile && (
            <button
              disabled={busy}
              className="btn btn-secondary ml-2"
              onClick={() => void signOut()}
            >
              {state === "signout-error" ? "Retry sign-out" : "Sign out"}
            </button>
          )}
        </section>
      </main>
    );
  return (
    <>
      <div className="site-container flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 text-sm">
        <span>
          Signed in as <strong>{profile?.full_name}</strong>
        </span>
        <button
          disabled={busy}
          className="btn btn-secondary"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
      {message && (
        <p role="status" className="site-container py-2 text-sm">
          {message}
        </p>
      )}
      {profile && typeof children === "function" ? children(profile) : children}
    </>
  );
}
