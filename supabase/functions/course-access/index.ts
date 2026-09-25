import { createClient } from "npm:@supabase/supabase-js@2.108.2";

const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const cors = {
  "Access-Control-Allow-Origin":
    Deno.env.get("ALLOWED_ORIGIN") || "https://arjun902.github.io",
  "Access-Control-Allow-Headers": "apikey,content-type,x-course-session",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Expose-Headers": "Retry-After",
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Origin",
  "Referrer-Policy": "no-referrer",
};
const reply = (body: unknown, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", ...extra },
  });
const hex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
const sha = async (value: string) =>
  hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const courseIds = new Set([
  "bca-digital-logic",
  "bca-c-programming",
  "csit-compiler-design",
  "csit-cryptography",
  "csit-discrete-mathematics",
  "csit-numerical-methods",
]);
async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await db.rpc(name, args);
  if (error) throw Error("Backend unavailable");
  return data;
}
// Pepper IP-derived keys: no raw IP addresses or request secrets are persisted.
async function attemptKey(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(serviceKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    if (Number(req.headers.get("content-length") || 0) > 4096)
      return reply({ error: "Request too large" }, 413);
    const raw = await req.text();
    if (raw.length > 4096) return reply({ error: "Request too large" }, 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return reply({ error: "Invalid request" }, 400);
    }
    if (!body || !courseIds.has(body.course_id))
      return reply({ error: "Unknown course" }, 400);
    const cid = body.course_id;
    if (body.action === "unlock") {
      if (
        typeof body.password !== "string" ||
        !body.password ||
        new TextEncoder().encode(body.password).length > 72 ||
        !uuid.test(body.client_id || "") ||
        typeof body.remember !== "boolean"
      )
        return reply(
          { error: "Enter the course password (up to 72 UTF-8 bytes)." },
          400,
        );
      // The gateway must supply the trusted rightmost proxy address. A missing
      // address fails closed instead of grouping an entire deployment together.
      const ip = req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
      if (!ip)
        return reply(
          {
            error:
              "Access service configuration is incomplete. Contact your instructor.",
          },
          503,
        );
      const device = await rpc("hub_take_course_attempt", {
        course_id_input: cid,
        key_hash_input: await attemptKey(`device:${cid}:${body.client_id}`),
        window_seconds_input: 900,
        maximum_input: 8,
      });
      if (!device?.[0]?.allowed)
        return reply(
          {
            error: `Too many attempts on this device. Try again in ${Math.ceil((device?.[0]?.retry_after || 900) / 60)} minutes.`,
            code: "rate_limited",
          },
          429,
          { "Retry-After": String(device?.[0]?.retry_after || 900) },
        );
      const network = await rpc("hub_take_course_attempt", {
        course_id_input: cid,
        key_hash_input: await attemptKey(`network:${cid}:${ip}`),
        window_seconds_input: 3600,
        maximum_input: 500,
      });
      if (!network?.[0]?.allowed)
        return reply(
          {
            error:
              "Unusually many attempts from this network. Try another trusted connection or retry later.",
            code: "rate_limited",
          },
          429,
          { "Retry-After": String(network?.[0]?.retry_after || 3600) },
        );
      const sid = crypto.randomUUID();
      const secret = hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
      const result = await rpc("hub_unlock_course", {
        cid,
        pass: body.password,
        sid,
        hashed_token: await sha(secret),
        remember: body.remember,
        device: body.client_id,
      });
      if (result.error)
        return reply(result, result.code === "invalid_password" ? 401 : 403);
      return reply({
        token: `${sid}.${secret}`,
        expires_at: result.expires_at,
      });
    }
    const token = req.headers.get("x-course-session") || "";
    const [sid, secret, ...rest] = token.split(".");
    if (
      !uuid.test(sid || "") ||
      !/^[0-9a-f]{64}$/.test(secret || "") ||
      rest.length
    )
      return reply(
        { error: "Unlock this course to continue.", code: "session_invalid" },
        401,
      );
    const hashed_token = await sha(secret);
    if (body.action === "lock-all") {
      await rpc("hub_lock_course_device", { sid, hashed_token });
      return reply({ ok: true });
    }
    if (body.action === "lock") {
      const result = await db
        .from("hub_course_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", sid)
        .eq("course_id", cid)
        .eq("token_hash", hashed_token);
      if (result.error) throw Error("Backend unavailable");
      return reply({ ok: true });
    }
    if (body.action === "validate") {
      const result = await rpc("hub_validate_course_session", {
        session_id_input: sid,
        token_hash_input: hashed_token,
      });
      if (result?.[0]?.course_id !== cid)
        return reply(
          {
            error:
              "Access expired or was revoked. Enter the current course password.",
            code: "session_invalid",
          },
          401,
        );
      return reply({ expires_at: result[0].expires_at });
    }
    if (body.action === "content") {
      const result = await rpc("hub_course_content", {
        sid,
        hashed_token,
        cid,
      });
      if (!result)
        return reply(
          {
            error:
              "Access expired or was revoked. Enter the current course password.",
            code: "session_invalid",
          },
          401,
        );
      return reply(result);
    }
    if (body.action === "file") {
      if (
        !uuid.test(body.resource_id || "") ||
        typeof body.download !== "boolean"
      )
        return reply({ error: "Invalid resource" }, 400);
      const grant = await rpc("hub_validate_course_session", {
        session_id_input: sid,
        token_hash_input: hashed_token,
      });
      if (grant?.[0]?.course_id !== cid)
        return reply(
          {
            error:
              "Access expired or was revoked. Enter the current course password.",
            code: "session_invalid",
          },
          401,
        );
      const result = await rpc("hub_course_file", {
        sid,
        hashed_token,
        cid,
        rid: body.resource_id,
        download: body.download,
      });
      if (!result)
        return reply(
          { error: "This material is unavailable or this action is disabled." },
          404,
        );
      if (result.external_url)
        return reply({ url: result.external_url, external: true });
      const signed = await db.storage
        .from("hub-materials")
        .createSignedUrl(
          result.file_path,
          60,
          body.download ? { download: result.filename || true } : undefined,
        );
      if (signed.error || !signed.data?.signedUrl)
        throw Error("Backend unavailable");
      return reply({
        url: signed.data.signedUrl,
        expires_in: 60,
        mime: result.mime,
      });
    }
    return reply({ error: "Unknown operation" }, 400);
  } catch {
    // Never log the request, password, token, DB error or signed URL.
    return reply(
      { error: "Course access is temporarily unavailable. Please retry." },
      503,
    );
  }
});
