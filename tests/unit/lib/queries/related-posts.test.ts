import { describe, it, expect } from "vitest";
import {
  selectRelatedPosts,
  RELATED_POSTS_FLOOR,
  RELATED_POSTS_CAP,
} from "@/lib/queries/related-posts-select";
import type { Post } from "@/payload-types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
// We build minimal Post shapes — the selection function only reads `id`,
// `slug`, `tags`, and `publishedAt`. Casting through `Post` lets us skip
// the 30-odd required fields the type insists on without affecting the
// function under test.
//
// Tag IDs (use small integers to keep the assertions readable):
//   1 = agentic-ai   2 = workflows   3 = systems   4 = tool-use
// ---------------------------------------------------------------------------

function makePost(props: {
  id: number;
  slug: string;
  publishedAt?: string | null;
  tagIds?: number[];
}): Post {
  const { id, slug, publishedAt = null, tagIds = [] } = props;
  return {
    id,
    slug,
    title: `Post ${id}`,
    summary: `Summary for ${slug}`,
    publishedAt,
    tags: tagIds, // depth-0 shape (number[]); selectRelatedPosts handles both shapes
  } as unknown as Post;
}

// Canonical fixture matching the production baseline at the time of
// authoring (per the baseline-audit comment on #420). Two posts share 3
// tags; two posts have no tags.
const fixtures = {
  agenticPatterns: makePost({
    id: 1,
    slug: "agentic-patterns-in-your-coding-workflow",
    publishedAt: "2026-05-16T00:00:00.000Z",
    tagIds: [],
  }),
  subagent: makePost({
    id: 2,
    slug: "subagent-orchestration-workflow",
    publishedAt: "2026-05-10T00:00:00.000Z",
    tagIds: [],
  }),
  whatTickets: makePost({
    id: 3,
    slug: "what-tickets-and-prs-are-actually-for",
    publishedAt: "2026-05-05T00:00:00.000Z",
    tagIds: [1, 2, 3, 4],
  }),
  rethinkingSystems: makePost({
    id: 4,
    slug: "rethinking-systems-in-the-agentic-age",
    publishedAt: "2026-05-01T00:00:00.000Z",
    tagIds: [1, 2, 3],
  }),
};

describe("selectRelatedPosts — primary path (tag overlap)", () => {
  it("returns tag-overlap candidates sorted by overlap count desc", () => {
    // Subject shares all 3 tags with `rethinking` and all 3 (of its 4) with
    // itself. A third post with only 1 overlap should rank below both.
    const subject = makePost({
      id: 100,
      slug: "subject",
      publishedAt: "2026-05-20T00:00:00.000Z",
      tagIds: [1, 2, 3],
    });
    const partialOverlap = makePost({
      id: 101,
      slug: "partial",
      publishedAt: "2026-05-19T00:00:00.000Z", // newer than the 3-overlap candidates
      tagIds: [1],
    });

    const result = selectRelatedPosts(subject, [
      partialOverlap,
      fixtures.whatTickets, // 3-overlap, older
      fixtures.rethinkingSystems, // 3-overlap, oldest
    ]);

    expect(result.map((p) => p.slug)).toEqual([
      "what-tickets-and-prs-are-actually-for",
      "rethinking-systems-in-the-agentic-age",
      "partial",
    ]);
  });

  it("breaks ties on overlap count by publishedAt desc", () => {
    // Two candidates with identical 2-tag overlap; the newer one wins.
    const subject = makePost({ id: 200, slug: "subject", tagIds: [1, 2] });
    const newer = makePost({
      id: 201,
      slug: "newer",
      publishedAt: "2026-04-01T00:00:00.000Z",
      tagIds: [1, 2, 9],
    });
    const older = makePost({
      id: 202,
      slug: "older",
      publishedAt: "2026-01-01T00:00:00.000Z",
      tagIds: [1, 2, 8],
    });

    const result = selectRelatedPosts(subject, [older, newer]);
    expect(result.map((p) => p.slug)).toEqual(["newer", "older"]);
  });
});

describe("selectRelatedPosts — fallback path (most-recent fill)", () => {
  it("fills the floor from most-recent when subject has no tags", () => {
    // The two untagged production posts (agentic-patterns, subagent) hit
    // this branch.
    const result = selectRelatedPosts(fixtures.agenticPatterns, [
      fixtures.subagent,
      fixtures.whatTickets,
      fixtures.rethinkingSystems,
    ]);

    // No tag overlap possible, so the fallback fills to the floor (2).
    // Most-recent-first ordering: subagent (2026-05-10), then
    // whatTickets (2026-05-05). rethinkingSystems is not added because
    // the floor is already met and the fallback does not dilute beyond
    // the floor.
    expect(result.map((p) => p.slug)).toEqual([
      "subagent-orchestration-workflow",
      "what-tickets-and-prs-are-actually-for",
    ]);
    expect(result.length).toBe(RELATED_POSTS_FLOOR);
  });

  it("fills entirely from most-recent when candidates share no tags with subject", () => {
    const subject = makePost({
      id: 300,
      slug: "subject",
      publishedAt: "2026-06-01T00:00:00.000Z",
      tagIds: [99],
    });
    const a = makePost({
      id: 301,
      slug: "a",
      publishedAt: "2026-05-01T00:00:00.000Z",
      tagIds: [1],
    });
    const b = makePost({
      id: 302,
      slug: "b",
      publishedAt: "2026-04-01T00:00:00.000Z",
      tagIds: [2],
    });

    const result = selectRelatedPosts(subject, [a, b]);
    expect(result.map((p) => p.slug)).toEqual(["a", "b"]);
  });
});

describe("selectRelatedPosts — mixed primary + fallback fill", () => {
  it("appends fallback posts after the primary overlap list when below floor", () => {
    // Subject has 1 candidate with overlap, plus 2 candidates with none.
    // The floor (2) forces the fallback to add one most-recent non-overlap.
    const subject = makePost({
      id: 400,
      slug: "subject",
      publishedAt: "2026-05-20T00:00:00.000Z",
      tagIds: [1],
    });
    const onlyOverlap = makePost({
      id: 401,
      slug: "only-overlap",
      publishedAt: "2026-05-19T00:00:00.000Z",
      tagIds: [1, 2],
    });
    const noOverlapNewer = makePost({
      id: 402,
      slug: "no-overlap-newer",
      publishedAt: "2026-05-18T00:00:00.000Z",
      tagIds: [9],
    });
    const noOverlapOlder = makePost({
      id: 403,
      slug: "no-overlap-older",
      publishedAt: "2026-05-15T00:00:00.000Z",
      tagIds: [8],
    });

    const result = selectRelatedPosts(subject, [
      noOverlapOlder,
      noOverlapNewer,
      onlyOverlap,
    ]);

    // Primary: [onlyOverlap]; floor 2 not met → fallback appends most-recent
    // non-overlap. The fallback fills *to the floor* (not to the cap) so
    // the primary tag-overlap signal is not diluted by additional
    // unrelated posts. noOverlapNewer fills the second slot;
    // noOverlapOlder is not added because the floor is already met.
    expect(result.map((p) => p.slug)).toEqual([
      "only-overlap",
      "no-overlap-newer",
    ]);
  });

  it("does not duplicate a post already chosen in the primary path", () => {
    // A candidate with overlap should never be re-added by the fallback
    // (which sorts on publishedAt only). This is the self-exclusion
    // invariant generalised to "no double-add".
    const subject = makePost({
      id: 500,
      slug: "subject",
      publishedAt: "2026-05-20T00:00:00.000Z",
      tagIds: [1],
    });
    const overlap = makePost({
      id: 501,
      slug: "overlap",
      publishedAt: "2026-05-19T00:00:00.000Z",
      tagIds: [1],
    });

    // Only one other post available; floor (2) cannot be met. Whatever the
    // function returns, it must contain `overlap` exactly once.
    const result = selectRelatedPosts(subject, [overlap]);
    const overlapCount = result.filter((p) => p.slug === "overlap").length;
    expect(overlapCount).toBe(1);
  });
});

describe("selectRelatedPosts — self-exclusion", () => {
  it("never includes the current post in results", () => {
    // The subject is also in the candidate list (mirrors what
    // `payload.find` actually returns: all published posts including self).
    const subject = fixtures.whatTickets;
    const result = selectRelatedPosts(subject, [
      fixtures.agenticPatterns,
      fixtures.subagent,
      fixtures.whatTickets, // self
      fixtures.rethinkingSystems,
    ]);

    expect(result.map((p) => p.slug)).not.toContain(
      "what-tickets-and-prs-are-actually-for"
    );
  });

  it("self-excludes even when self has tag overlap with itself", () => {
    // The trivial case where the only "tag overlap" available is self.
    // The function must not exploit it.
    const subject = makePost({
      id: 600,
      slug: "lonely",
      publishedAt: "2026-05-20T00:00:00.000Z",
      tagIds: [1, 2, 3],
    });
    const result = selectRelatedPosts(subject, [subject]);
    expect(result).toEqual([]);
  });
});

describe("selectRelatedPosts — cap of 4", () => {
  it("returns at most RELATED_POSTS_CAP results", () => {
    expect(RELATED_POSTS_CAP).toBe(4);

    const subject = makePost({
      id: 700,
      slug: "subject",
      publishedAt: "2026-06-01T00:00:00.000Z",
      tagIds: [1],
    });
    // Six candidates all sharing the same tag.
    const candidates = Array.from({ length: 6 }, (_, i) =>
      makePost({
        id: 700 + i + 1,
        slug: `cand-${i}`,
        publishedAt: `2026-0${i + 1}-01T00:00:00.000Z`,
        tagIds: [1],
      })
    );

    const result = selectRelatedPosts(subject, candidates);
    expect(result.length).toBe(RELATED_POSTS_CAP);
  });

  it("does not exceed the floor when the fallback is doing the filling", () => {
    // When fallback is load-bearing (no tag overlap available), the
    // function fills to the floor (2) and stops — it does not pad up to
    // the cap with most-recent posts. This keeps the related list from
    // appearing artificially long with weakly-related entries; the cap
    // is the *primary path's* maximum.
    const subject = makePost({
      id: 800,
      slug: "subject",
      publishedAt: "2026-06-01T00:00:00.000Z",
      tagIds: [99], // no overlap with any candidate
    });
    const candidates = Array.from({ length: 6 }, (_, i) =>
      makePost({
        id: 800 + i + 1,
        slug: `cand-${i}`,
        publishedAt: `2026-0${i + 1}-01T00:00:00.000Z`,
        tagIds: [1],
      })
    );

    const result = selectRelatedPosts(subject, candidates);
    expect(result.length).toBe(RELATED_POSTS_FLOOR);
  });
});

describe("selectRelatedPosts — floor of 2", () => {
  it("returns at least RELATED_POSTS_FLOOR results when enough candidates exist", () => {
    expect(RELATED_POSTS_FLOOR).toBe(2);

    // Subject with no tags, two non-overlapping candidates: the floor is
    // met entirely by fallback.
    const subject = makePost({ id: 900, slug: "subject", tagIds: [] });
    const a = makePost({
      id: 901,
      slug: "a",
      publishedAt: "2026-05-10T00:00:00.000Z",
      tagIds: [],
    });
    const b = makePost({
      id: 902,
      slug: "b",
      publishedAt: "2026-05-05T00:00:00.000Z",
      tagIds: [],
    });

    const result = selectRelatedPosts(subject, [a, b]);
    expect(result.length).toBeGreaterThanOrEqual(RELATED_POSTS_FLOOR);
  });

  it("returns fewer than the floor only when the candidate pool is exhausted", () => {
    // Corpus has 2 posts total (subject + one other). The floor is 2 but
    // there is only one other post. The function returns what it has
    // rather than padding with self or fabricating entries.
    const subject = makePost({ id: 1000, slug: "subject", tagIds: [] });
    const onlyOther = makePost({
      id: 1001,
      slug: "only-other",
      publishedAt: "2026-05-10T00:00:00.000Z",
      tagIds: [],
    });

    const result = selectRelatedPosts(subject, [onlyOther]);
    expect(result.map((p) => p.slug)).toEqual(["only-other"]);
    // Note: the component (`RelatedPosts.tsx`) gates the render on
    // length ≥ 2 so the section disappears in this edge case rather than
    // rendering a single-item "Related Posts" list.
  });
});

describe("selectRelatedPosts — depth-1 (Tag object) input shape", () => {
  it("accepts the depth-1 shape where tags are resolved to Tag objects", () => {
    // Payload returns `(number | Tag)[]` at depth 1. The function must
    // handle both. This test uses Tag objects with `id` fields.
    const subject = {
      id: 1100,
      slug: "subject",
      title: "Subject",
      summary: "",
      publishedAt: "2026-05-20T00:00:00.000Z",
      tags: [
        { id: 1, name: "agentic-ai", slug: "agentic-ai" },
        { id: 2, name: "workflows", slug: "workflows" },
      ],
    } as unknown as Post;

    const candidate = {
      id: 1101,
      slug: "candidate",
      title: "Candidate",
      summary: "",
      publishedAt: "2026-05-19T00:00:00.000Z",
      tags: [{ id: 1, name: "agentic-ai", slug: "agentic-ai" }],
    } as unknown as Post;

    const result = selectRelatedPosts(subject, [candidate]);
    expect(result.map((p) => p.slug)).toEqual(["candidate"]);
  });
});
