import { describe, it, expect } from "vitest";
import {
  AI_BOT_USER_AGENTS,
  DISALLOWED_PATHS,
  NAMED_BOT_USER_AGENTS,
  SEARCH_BOT_USER_AGENTS,
  buildRobotsRules,
} from "@/lib/robots-config";

/**
 * Issue #417: explicit Allow/Disallow rules for named AI + search
 * crawlers. The shape of the rules array is part of our SEO/AI-
 * discovery contract — adding/removing a bot is intentional, so this
 * suite tripwires drift in either direction.
 */

describe("robots-config", () => {
  it("emits one rule per named bot plus a wildcard fallback", () => {
    const rules = buildRobotsRules();
    expect(rules).toHaveLength(NAMED_BOT_USER_AGENTS.length + 1);
    const last = rules[rules.length - 1];
    expect(last.userAgent).toBe("*");
  });

  it("applies the same allow + disallow to every block", () => {
    const rules = buildRobotsRules();
    for (const rule of rules) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toEqual([...DISALLOWED_PATHS]);
    }
  });

  it("includes every required AI grounding crawler from issue #417", () => {
    const userAgents = buildRobotsRules().map((r) => r.userAgent);
    for (const bot of AI_BOT_USER_AGENTS) {
      expect(userAgents).toContain(bot);
    }
  });

  it("includes every required search crawler from issue #417", () => {
    const userAgents = buildRobotsRules().map((r) => r.userAgent);
    for (const bot of SEARCH_BOT_USER_AGENTS) {
      expect(userAgents).toContain(bot);
    }
  });

  it("emits no duplicate user-agents", () => {
    const userAgents = buildRobotsRules().map((r) => r.userAgent);
    expect(new Set(userAgents).size).toBe(userAgents.length);
  });

  // Snapshot of the structured rules. Snapshotting the object (vs the
  // serialized robots.txt string) tests our intent — adding or removing
  // a named bot must be an intentional snapshot update. Next.js owns
  // the string serializer; that path is verified post-deploy via curl.
  it("matches the named-block snapshot", () => {
    expect(buildRobotsRules()).toMatchSnapshot();
  });
});
