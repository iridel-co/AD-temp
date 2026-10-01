import {
  CONSENT_VERSION,
  HONEYPOT_FIELD,
  interestPayloadSchema,
} from "@/lib/interest"

const MAX_BODY_BYTES = 10_000

export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") ?? 0)
  if (length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "invalid" }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  // Honeypot: a real person never fills it. Pretend success, write nothing.
  const trap = (body as Record<string, unknown> | null)?.[HONEYPOT_FIELD]
  if (typeof trap === "string" && trap.trim() !== "") {
    return Response.json({ ok: true })
  }

  const parsed = interestPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 })
  }
  const { fullName, email, designation, company, interest, sourcePath } =
    parsed.data

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    console.error("interest: SUPABASE_URL or SUPABASE_SECRET_KEY is not set")
    return Response.json({ ok: false, error: "server" }, { status: 500 })
  }

  // New sb_secret_… keys are not JWTs; only legacy service_role JWTs (eyJ…)
  // also need the Authorization header.
  const headers: Record<string, string> = {
    apikey: key,
    "content-type": "application/json",
  }
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`

  try {
    const res = await fetch(`${url}/rest/v1/rpc/upsert_interest_signup`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        p_full_name: fullName.trim(),
        p_email: email.trim().toLowerCase(),
        p_designation: designation.trim(),
        p_company: company?.trim() || null,
        p_interest: interest,
        p_source_path: sourcePath ?? null,
        p_consent_privacy: true,
        p_consent_version: CONSENT_VERSION,
        p_user_agent: req.headers.get("user-agent")?.slice(0, 512) ?? null,
      }),
    })
    if (!res.ok) {
      console.error("interest upsert failed", res.status, await res.text())
      return Response.json({ ok: false, error: "server" }, { status: 500 })
    }
  } catch (err) {
    console.error(
      "interest upsert failed",
      err instanceof Error ? err.message : "unknown"
    )
    return Response.json({ ok: false, error: "server" }, { status: 500 })
  }

  return Response.json({ ok: true })
}
