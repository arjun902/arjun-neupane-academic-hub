import { createClient } from "npm:@supabase/supabase-js@2.108.2";
const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const cors = {
  "Access-Control-Allow-Origin":
    Deno.env.get("ALLOWED_ORIGIN") || "https://arjun902.github.io",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
function required(v: unknown, max = 120) {
  if (typeof v !== "string" || !v.trim() || v.length > max)
    throw Error("Invalid input");
  return v.trim();
}
function credential(v: unknown) {
  if (typeof v !== "string" || !v.length || v.length > 128)
    throw Error("Invalid password");
  return v;
}
function expiry(v: unknown) {
  if (v === null || v === "") return null;
  if (typeof v !== "string" || !Number.isFinite(Date.parse(v)))
    throw Error("Invalid expiry");
  return new Date(v).toISOString();
}
function password() {
  return (
    "Aa1!" +
    Array.from(crypto.getRandomValues(new Uint8Array(24)), (x) =>
      String.fromCharCode(33 + (x % 90)),
    ).join("")
  );
}
async function ok(q: PromiseLike<{ error: unknown; data?: unknown }>) {
  const r = await q;
  if (r.error) throw Error("Operation failed");
  return r.data;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const jwt = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!jwt) return reply({ error: "Sign in required" }, 401);
    const { data: identity, error } = await db.auth.getUser(jwt);
    if (error || !identity.user)
      return reply({ error: "Sign in required" }, 401);
    const user = identity.user;
    const { data: account } = await db
      .from("hub_accounts")
      .select("*")
      .eq("id", user.id)
      .single();
    // Decode the verified token's claims, not current user metadata: reject pre-reset tokens.
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
          (c) => c.charCodeAt(0),
        ),
      ),
    );
    if (
      !account ||
      account.status !== "active" ||
      (account.expires_at && Date.parse(account.expires_at) <= Date.now()) ||
      String(payload.app_metadata?.credential_version) !==
        String(account.credential_version)
    )
      return reply(
        { error: "Access is unavailable. Contact your instructor." },
        403,
      );
    const { data: allowed, error: limitError } = await db.rpc("hub_limit", {
      actor: user.id,
    });
    if (limitError || !allowed)
      return reply({ error: "Too many requests. Try again in a minute." }, 429);
    if (Number(req.headers.get("content-length") || 0) > 16384)
      return reply({ error: "Request too large" }, 413);
    const raw = await req.text();
    if (raw.length > 16384) return reply({ error: "Request too large" }, 413);
    const body = JSON.parse(raw);
    if (body.action === "change-password") {
      const next = credential(body.password),
        current = credential(body.current_password);
      if (next.length < 12 || next === current)
        return reply(
          { error: "Use a different password with at least 12 characters." },
          400,
        );
      const verifier = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const verified = await verifier.auth.signInWithPassword({
        email: account.email,
        password: current,
      });
      if (verified.error)
        return reply({ error: "Current password is incorrect." }, 400);
      await verifier.auth.signOut({ scope: "local" });
      const version = account.credential_version + 1;
      const operation = crypto.randomUUID();
      // Invalidate ALL old JWTs before opening access; an interrupted update fails closed.
      const reservation = await db
        .from("hub_accounts")
        .update({
          must_change_password: true,
          credential_version: version,
          credential_operation: operation,
        })
        .eq("id", user.id)
        .eq("credential_version", account.credential_version)
        .is("credential_operation", null)
        .select("id");
      if (reservation.error || !reservation.data?.length)
        throw Error(
          "Credentials changed concurrently. Contact your instructor.",
        );
      await ok(
        db.auth.admin.updateUserById(user.id, {
          password: next,
          app_metadata: { credential_version: version },
        }),
      );
      const { data: changed, error: changeError } = await db
        .from("hub_accounts")
        .update({ must_change_password: false, credential_operation: null })
        .eq("id", user.id)
        .eq("credential_version", version)
        .eq("credential_operation", operation)
        .select("id");
      if (changeError || !changed?.length)
        throw Error(
          "Credentials changed concurrently. Contact your instructor.",
        );
      await ok(
        db
          .from("hub_audit")
          .insert({
            actor_id: user.id,
            action: "password_changed",
            entity: "account",
            entity_id: user.id,
          }),
      );
      return reply({ ok: true });
    }
    if (account.role !== "admin" || account.must_change_password)
      return reply({ error: "Administrator access required" }, 403);
    let temporary: string | undefined;
    let target: string | undefined;
    if (body.action === "create-student") {
      const email = required(body.email, 254).toLowerCase(),
        name = required(body.full_name);
      const expiresAt = expiry(body.expires_at ?? null);
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email))
        throw Error("Invalid student details");
      temporary = password();
      const created = await db.auth.admin.createUser({
        email,
        password: temporary,
        email_confirm: true,
        app_metadata: { credential_version: 1 },
        user_metadata: { full_name: name },
      });
      if (created.error || !created.data.user)
        throw Error(
          "Account could not be created. Check whether the email already exists.",
        );
      target = created.data.user.id;
      const saved = await db
        .from("hub_accounts")
        .insert({
          id: target,
          email,
          full_name: name,
          expires_at: expiresAt,
        });
      if (saved.error) {
        await db.auth.admin.deleteUser(target);
        throw Error("Account could not be saved");
      }
    } else {
      target = required(body.student_id, 36);
      const { data: student } = await db
        .from("hub_accounts")
        .select("*")
        .eq("id", target)
        .eq("role", "student")
        .single();
      if (!student) throw Error("Student not found");
      if (body.action === "reset-password") {
        temporary = password();
        const version = student.credential_version + 1;
        const operation = crypto.randomUUID();
        // Revoke database access before touching Auth. Failure leaves the account closed.
        const reserved = await db
          .from("hub_accounts")
          .update({
            must_change_password: true,
            credential_version: version,
            credential_operation: operation,
          })
          .eq("id", target)
          .eq("credential_version", student.credential_version)
          .is("credential_operation", null)
          .select("id");
        if (reserved.error || !reserved.data?.length)
          throw Error("Concurrent update; retry");
        await ok(
          db.auth.admin.updateUserById(target, {
            password: temporary,
            app_metadata: { credential_version: version },
          }),
        );
        const finalized = await db
          .from("hub_accounts")
          .update({ credential_operation: null })
          .eq("id", target)
          .eq("credential_version", version)
          .eq("credential_operation", operation)
          .select("id");
        if (finalized.error || !finalized.data?.length)
          throw Error(
            "Credential reset needs operator recovery. Access remains closed.",
          );
      } else if (body.action === "update-student") {
        if (!["active", "suspended"].includes(body.status))
          throw Error("Invalid status");
        await ok(
          db
            .from("hub_accounts")
            .update({
              full_name: required(body.full_name),
              status: body.status,
              expires_at: expiry(body.expires_at),
            })
            .eq("id", target),
        );
      } else if (body.action === "enroll") {
        await ok(
          db
            .from("hub_enrollments")
            .upsert({
              student_id: target,
              course_id: required(body.course_id),
              expires_at: expiry(body.expires_at),
            }),
        );
      } else if (body.action === "revoke") {
        await ok(
          db
            .from("hub_enrollments")
            .delete()
            .eq("student_id", target)
            .eq("course_id", required(body.course_id)),
        );
      } else throw Error("Unknown operation");
    }
    await ok(
      db
        .from("hub_audit")
        .insert({
          actor_id: user.id,
          action: body.action,
          entity: "account",
          entity_id: target,
        }),
    );
    return reply({
      ok: true,
      student_id: target,
      ...(temporary ? { temporary_password: temporary } : {}),
    });
  } catch (e) {
    return reply(
      { error: e instanceof Error ? e.message : "Request failed" },
      400,
    );
  }
});
