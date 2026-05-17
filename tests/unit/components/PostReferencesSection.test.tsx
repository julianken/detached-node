import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostReferencesSection } from "@/components/PostReferencesSection";
import type { ReferenceInput } from "@/lib/schema/citation";

// ---------------------------------------------------------------------------
// Fixtures — ReferenceInput rows mirror the Post.references field shape.
// ---------------------------------------------------------------------------

const fullRef: ReferenceInput = {
  title: "Attention Is All You Need",
  url: "https://arxiv.org/abs/1706.03762",
  author: "Vaswani et al.",
  publication: "NeurIPS",
  date: "2017-06-12",
};

const titleAndUrlOnly: ReferenceInput = {
  title: "A minimal entry",
  url: "https://example.com/minimal",
};

const noDate: ReferenceInput = {
  title: "Reference without a date",
  url: "https://example.com/no-date",
  author: "Anon",
  publication: "Somewhere",
};

const noUrl: ReferenceInput = {
  title: "Offline citation",
  author: "Print Author",
  publication: "Print Journal",
  date: "1999-01-01",
};

// ---------------------------------------------------------------------------

describe("PostReferencesSection", () => {
  it("returns null when references array is empty", () => {
    const { container } = render(<PostReferencesSection references={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders one <li> per reference with the correct count", () => {
    render(
      <PostReferencesSection
        references={[fullRef, titleAndUrlOnly, noDate]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("numbers <li id='ref-N'> 1-indexed in array order", () => {
    const { container } = render(
      <PostReferencesSection
        references={[fullRef, titleAndUrlOnly, noDate]}
      />,
    );

    expect(container.querySelector("#ref-1")).not.toBeNull();
    expect(container.querySelector("#ref-2")).not.toBeNull();
    expect(container.querySelector("#ref-3")).not.toBeNull();
    // 1-indexed: ref-0 must NOT exist
    expect(container.querySelector("#ref-0")).toBeNull();
  });

  it("wraps the matching <li id='ref-N'> around the corresponding title", () => {
    const { container } = render(
      <PostReferencesSection
        references={[fullRef, titleAndUrlOnly]}
      />,
    );

    const ref1 = container.querySelector("#ref-1");
    const ref2 = container.querySelector("#ref-2");
    expect(ref1?.textContent).toContain(fullRef.title);
    expect(ref2?.textContent).toContain(titleAndUrlOnly.title);
  });

  it("renders a section labelled by the references heading", () => {
    render(
      <PostReferencesSection
        references={[fullRef]}
      />,
    );

    const section = screen.getByRole("region", { name: /references/i });
    expect(section).toHaveAttribute("id", "references");
    const heading = screen.getByRole("heading", { name: /references/i });
    expect(heading).toHaveAttribute("id", "references-heading");
  });

  it("renders the title as an external link when url is present", () => {
    render(
      <PostReferencesSection
        references={[fullRef]}
      />,
    );

    const link = screen.getByRole("link", { name: /attention is all you need/i });
    expect(link).toHaveAttribute("href", fullRef.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the title without a link when url is absent", () => {
    render(
      <PostReferencesSection
        references={[noUrl]}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /offline citation/i }),
    ).toBeNull();
    expect(screen.getByText(/offline citation/i)).toBeInTheDocument();
  });

  it("omits the meta line when author, publication, and date are all empty", () => {
    const { container } = render(
      <PostReferencesSection references={[titleAndUrlOnly]} />,
    );

    // The meta line carries the font-mono class; with no fields it should
    // not be present.
    const metaLines = container.querySelectorAll(".font-mono");
    expect(metaLines.length).toBe(0);
  });

  it("renders the meta line when only some fields are populated", () => {
    const { container } = render(
      <PostReferencesSection references={[noDate]} />,
    );

    const metaLine = container.querySelector(".font-mono");
    expect(metaLine).not.toBeNull();
    expect(metaLine?.textContent).toContain(noDate.author);
    expect(metaLine?.textContent).toContain(noDate.publication);
  });

  it("renders the date inside a <time dateTime> element when present", () => {
    const { container } = render(
      <PostReferencesSection references={[fullRef]} />,
    );

    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl).toHaveAttribute("dateTime", fullRef.date);
  });

  it("wraps the title in <cite> for semantic correctness", () => {
    const { container } = render(
      <PostReferencesSection references={[fullRef]} />,
    );

    const citeEl = container.querySelector("cite");
    expect(citeEl).not.toBeNull();
    expect(citeEl?.textContent).toBe(fullRef.title);
  });

  it("survives null-valued optional fields gracefully", () => {
    const refWithNulls: ReferenceInput = {
      title: "Null-field reference",
      url: null,
      author: null,
      publication: null,
      date: null,
    };

    const { container } = render(
      <PostReferencesSection references={[refWithNulls]} />,
    );

    expect(container.querySelector("#ref-1")).not.toBeNull();
    expect(container.querySelector(".font-mono")).toBeNull();
  });

  it("accepts ReferenceInput[] (compile-time contract — also used by mapReferenceToCitation)", () => {
    // This test exists primarily so a future refactor that drifts the
    // component's prop type away from ReferenceInput[] fails at type-check.
    // The dual-consumer test in tests/unit/lib/schema/blog-posting.test.tsx
    // also asserts this contract at the value level.
    const refs: ReferenceInput[] = [fullRef, noUrl];
    render(<PostReferencesSection references={refs} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
