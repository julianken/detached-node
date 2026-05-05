import type { NextRequest } from "next/server";

const VALID_METRICS = new Set(["LCP", "INP", "CLS", "TTFB", "FCP", "FID"]);
const MAX_BODY_BYTES = 2048;

type VitalPayload = {
  id?: unknown;
  name?: unknown;
  value?: unknown;
  rating?: unknown;
  delta?: unknown;
  navigationType?: unknown;
  path?: unknown;
};

export async function POST(req: NextRequest): Promise<Response> {
  const raw = await req.text();
  if (raw.length === 0 || raw.length > MAX_BODY_BYTES) {
    return new Response(null, { status: 204 });
  }

  let payload: VitalPayload;
  try {
    payload = JSON.parse(raw) as VitalPayload;
  } catch {
    return new Response(null, { status: 204 });
  }

  if (
    typeof payload.name !== "string" ||
    !VALID_METRICS.has(payload.name) ||
    typeof payload.value !== "number" ||
    !Number.isFinite(payload.value)
  ) {
    return new Response(null, { status: 204 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const device = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";

  console.log(
    JSON.stringify({
      severity: "INFO",
      message: "web_vital",
      vital: {
        name: payload.name,
        value: payload.value,
        rating: typeof payload.rating === "string" ? payload.rating : undefined,
        delta: typeof payload.delta === "number" ? payload.delta : undefined,
        navigationType:
          typeof payload.navigationType === "string"
            ? payload.navigationType
            : undefined,
        id: typeof payload.id === "string" ? payload.id : undefined,
      },
      path: typeof payload.path === "string" ? payload.path : undefined,
      device,
    })
  );

  return new Response(null, { status: 204 });
}
