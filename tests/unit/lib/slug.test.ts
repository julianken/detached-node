import { describe, it, expect, vi } from "vitest";
import { generateSlug, createSlugHook } from "@/lib/slug";

describe("generateSlug", () => {
  it("converts text to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("hello world")).toBe("hello-world");
  });

  it("replaces special characters with hyphens", () => {
    expect(generateSlug("hello@world!")).toBe("hello-world");
  });

  it("handles multiple consecutive special characters", () => {
    expect(generateSlug("hello!!!world")).toBe("hello-world");
  });

  it("removes leading hyphens", () => {
    expect(generateSlug("---hello")).toBe("hello");
  });

  it("removes trailing hyphens", () => {
    expect(generateSlug("hello---")).toBe("hello");
  });

  it("removes both leading and trailing hyphens", () => {
    expect(generateSlug("---hello---")).toBe("hello");
  });

  it("preserves numbers", () => {
    expect(generateSlug("hello123world")).toBe("hello123world");
  });

  it("handles titles with numbers", () => {
    expect(generateSlug("Top 10 Tips")).toBe("top-10-tips");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles only special characters", () => {
    expect(generateSlug("@#$%^&*")).toBe("");
  });

  it("handles real-world title examples", () => {
    expect(generateSlug("The Architecture of Persuasion")).toBe(
      "the-architecture-of-persuasion"
    );
    expect(generateSlug("Decoding Corporate Newspeak")).toBe(
      "decoding-corporate-newspeak"
    );
    expect(generateSlug("Notes from the Attention Economy")).toBe(
      "notes-from-the-attention-economy"
    );
  });

  it("handles apostrophes and quotes", () => {
    expect(generateSlug("John's Blog Post")).toBe("john-s-blog-post");
    expect(generateSlug('The "Quick" Fox')).toBe("the-quick-fox");
  });

  it("handles unicode characters by removing them", () => {
    expect(generateSlug("café")).toBe("caf");
    expect(generateSlug("über")).toBe("ber");
  });
});

describe("createSlugHook", () => {
  it("returns a function", () => {
    const hook = createSlugHook("title");
    expect(typeof hook).toBe("function");
  });

  describe("with title source field", () => {
    const hook = createSlugHook("title");

    it("preserves existing slug value", () => {
      const result = hook({
        value: "existing-slug",
        data: { title: "New Title" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe("existing-slug");
    });

    it("generates slug from title when value is empty", () => {
      const result = hook({
        value: "",
        data: { title: "Hello World" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe("hello-world");
    });

    it("generates slug from title when value is undefined", () => {
      const result = hook({
        value: undefined,
        data: { title: "Hello World" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe("hello-world");
    });

    it("returns value when data is undefined", () => {
      const result = hook({
        value: undefined,
        data: undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe(undefined);
    });

    it("returns value when source field is missing", () => {
      const result = hook({
        value: undefined,
        data: { name: "Something" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe(undefined);
    });
  });

  describe("with name source field", () => {
    const hook = createSlugHook("name");

    it("generates slug from name field", () => {
      const result = hook({
        value: "",
        data: { name: "Propaganda" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe("propaganda");
    });

    it("does not use title field when name is the source", () => {
      const result = hook({
        value: "",
        data: { title: "Hello", name: "" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBe("");
    });
  });
});
