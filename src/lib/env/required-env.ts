/**
 * Strict environment-variable validator.
 *
 * Use this to fail fast — with a readable, actionable error — whenever a
 * module depends on env vars that must be set. The previous pattern
 * (`process.env.FOO || ''`) silently substitutes an empty string, which
 * surfaces as a confusing downstream failure (e.g. Postgres refusing an
 * empty connection string, Payload rejecting an empty secret).
 *
 * Deployment context: Vercel scopes some vars (e.g. `PAYLOAD_SECRET`) per
 * environment. A Production-only secret breaks Preview deploys; we want the
 * error to name every missing var at once and identify the phase, so the
 * fix is a single trip to the dashboard.
 */

function phaseFromEnv(): string {
  return process.env.NEXT_PHASE ?? process.env.VERCEL_ENV ?? 'runtime'
}

export function assertRequiredEnv<const T extends readonly string[]>(
  names: T,
  opts?: { phase?: string },
): { readonly [K in T[number]]: string } {
  const missing: string[] = []
  const values: Record<string, string> = {}

  for (const name of names) {
    const raw = process.env[name]
    if (raw === undefined || raw === '') {
      missing.push(name)
    } else {
      values[name] = raw
    }
  }

  if (missing.length > 0) {
    const phase = opts?.phase ?? phaseFromEnv()
    throw new Error(
      `Missing required environment variables: [${missing.join(', ')}] (phase: ${phase}). See docs/deployment.md#preview-environment.`,
    )
  }

  return Object.freeze(values) as { readonly [K in T[number]]: string }
}
