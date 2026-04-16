import { describe, it, expect } from "vitest";
import {
  // Slug
  isValidSlug,
  toSlug,
  tryToSlug,
  type Slug,

  // ISO Date
  isValidISODateString,
  toISODateString,
  tryToISODateString,
  type ISODateString,

  // Document ID
  isValidDocumentId,
  toDocumentId,
  tryToDocumentId,
  type DocumentId,

  // Email
  isValidEmail,
  toEmail,
  tryToEmail,
  type Email,
} from "@/lib/types/branded";

// =============================================================================
// Slug Tests
// =============================================================================

describe("Slug branded type", () => {
  describe("isValidSlug", () => {
    it("accepts valid lowercase slugs", () => {
      expect(isValidSlug("hello")).toBe(true);
      expect(isValidSlug("hello-world")).toBe(true);
      expect(isValidSlug("hello-world-123")).toBe(true);
      expect(isValidSlug("123")).toBe(true);
      expect(isValidSlug("a")).toBe(true);
    });

    it("accepts slugs with numbers", () => {
      expect(isValidSlug("post-123")).toBe(true);
      expect(isValidSlug("2024-01-15-my-post")).toBe(true);
      expect(isValidSlug("top-10-tips")).toBe(true);
    });

    it("rejects uppercase characters", () => {
      expect(isValidSlug("Hello")).toBe(false);
      expect(isValidSlug("HELLO")).toBe(false);
      expect(isValidSlug("Hello-World")).toBe(false);
    });

    it("rejects special characters", () => {
      expect(isValidSlug("hello@world")).toBe(false);
      expect(isValidSlug("hello_world")).toBe(false);
      expect(isValidSlug("hello.world")).toBe(false);
      expect(isValidSlug("hello/world")).toBe(false);
      expect(isValidSlug("hello world")).toBe(false);
    });

    it("rejects leading hyphens", () => {
      expect(isValidSlug("-hello")).toBe(false);
      expect(isValidSlug("--hello")).toBe(false);
    });

    it("rejects trailing hyphens", () => {
      expect(isValidSlug("hello-")).toBe(false);
      expect(isValidSlug("hello--")).toBe(false);
    });

    it("rejects consecutive hyphens", () => {
      expect(isValidSlug("hello--world")).toBe(false);
      expect(isValidSlug("hello---world")).toBe(false);
    });

    it("rejects empty strings", () => {
      expect(isValidSlug("")).toBe(false);
    });

    it("rejects slugs over 200 characters", () => {
      const longSlug = "a".repeat(201);
      expect(isValidSlug(longSlug)).toBe(false);

      const maxLengthSlug = "a".repeat(200);
      expect(isValidSlug(maxLengthSlug)).toBe(true);
    });

    it("handles real-world blog slugs", () => {
      expect(isValidSlug("the-architecture-of-agent-systems")).toBe(true);
      expect(isValidSlug("decoding-tool-use-patterns")).toBe(true);
      expect(isValidSlug("notes-on-autonomous-workflows")).toBe(true);
      expect(isValidSlug("2024-review")).toBe(true);
    });
  });

  describe("toSlug", () => {
    it("returns branded Slug for valid input", () => {
      const slug: Slug = toSlug("hello-world");
      expect(slug).toBe("hello-world");
    });

    it("throws error for invalid slug", () => {
      expect(() => toSlug("Hello-World")).toThrow("Invalid slug format");
      expect(() => toSlug("")).toThrow("Invalid slug format");
      expect(() => toSlug("hello--world")).toThrow("Invalid slug format");
    });

    it("includes helpful error message", () => {
      expect(() => toSlug("INVALID")).toThrow(/lowercase alphanumeric/);
    });
  });

  describe("tryToSlug", () => {
    it("returns Slug for valid input", () => {
      const result = tryToSlug("hello-world");
      expect(result).toBe("hello-world");
    });

    it("returns null for invalid input", () => {
      expect(tryToSlug("Hello-World")).toBeNull();
      expect(tryToSlug("")).toBeNull();
      expect(tryToSlug("hello--world")).toBeNull();
    });

    it("can be used in conditional type narrowing", () => {
      const maybeSlug = tryToSlug("valid-slug");
      if (maybeSlug !== null) {
        // TypeScript knows maybeSlug is Slug here
        const slug: Slug = maybeSlug;
        expect(slug).toBe("valid-slug");
      }
    });
  });
});

// =============================================================================
// ISO Date String Tests
// =============================================================================

describe("ISODateString branded type", () => {
  describe("isValidISODateString", () => {
    it("accepts valid ISO 8601 date strings", () => {
      expect(isValidISODateString("2024-01-15T10:30:00.000Z")).toBe(true);
      expect(isValidISODateString("2024-12-31T23:59:59.999Z")).toBe(true);
      expect(isValidISODateString("2000-01-01T00:00:00.000Z")).toBe(true);
    });

    it("rejects date-only strings", () => {
      expect(isValidISODateString("2024-01-15")).toBe(false);
    });

    it("rejects datetime without Z suffix", () => {
      expect(isValidISODateString("2024-01-15T10:30:00.000")).toBe(false);
      expect(isValidISODateString("2024-01-15T10:30:00")).toBe(false);
    });

    it("rejects invalid dates", () => {
      expect(isValidISODateString("invalid")).toBe(false);
      expect(isValidISODateString("2024-13-01T10:30:00.000Z")).toBe(false); // Invalid month
      expect(isValidISODateString("")).toBe(false);
    });

    it("rejects timezone offsets (requires UTC Z)", () => {
      expect(isValidISODateString("2024-01-15T10:30:00.000+05:00")).toBe(false);
    });
  });

  describe("toISODateString", () => {
    it("returns branded ISODateString for valid string", () => {
      const dateStr: ISODateString = toISODateString("2024-01-15T10:30:00.000Z");
      expect(dateStr).toBe("2024-01-15T10:30:00.000Z");
    });

    it("converts Date objects to ISODateString", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const dateStr: ISODateString = toISODateString(date);
      expect(dateStr).toBe("2024-01-15T10:30:00.000Z");
    });

    it("throws error for invalid string", () => {
      expect(() => toISODateString("invalid")).toThrow("Invalid ISO date string");
      expect(() => toISODateString("2024-01-15")).toThrow("Invalid ISO date string");
    });

    it("throws error for invalid Date object", () => {
      const invalidDate = new Date("invalid");
      expect(() => toISODateString(invalidDate)).toThrow("Invalid Date object");
    });
  });

  describe("tryToISODateString", () => {
    it("returns ISODateString for valid input", () => {
      const result = tryToISODateString("2024-01-15T10:30:00.000Z");
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("returns ISODateString for valid Date", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const result = tryToISODateString(date);
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("returns null for invalid input", () => {
      expect(tryToISODateString("invalid")).toBeNull();
      expect(tryToISODateString("2024-01-15")).toBeNull();
      expect(tryToISODateString(new Date("invalid"))).toBeNull();
    });
  });
});

// =============================================================================
// Document ID Tests
// =============================================================================

describe("DocumentId branded type", () => {
  const validUuid = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
  const anotherUuid = "12345678-1234-4abc-9def-123456789abc";

  describe("isValidDocumentId", () => {
    it("accepts valid UUID v4 strings", () => {
      expect(isValidDocumentId(validUuid)).toBe(true);
      expect(isValidDocumentId(anotherUuid)).toBe(true);
    });

    it("rejects non-UUID strings", () => {
      expect(isValidDocumentId("not-a-uuid")).toBe(false);
      expect(isValidDocumentId("12345")).toBe(false);
      expect(isValidDocumentId("")).toBe(false);
    });

    it("rejects non-string values", () => {
      expect(isValidDocumentId(42)).toBe(false);
      expect(isValidDocumentId(null)).toBe(false);
      expect(isValidDocumentId(undefined)).toBe(false);
      expect(isValidDocumentId({})).toBe(false);
    });

    it("rejects UUIDs with wrong version", () => {
      // Version 1 UUID (third group starts with 1, not 4)
      expect(isValidDocumentId("a1b2c3d4-e5f6-1a7b-8c9d-0e1f2a3b4c5d")).toBe(false);
    });
  });

  describe("toDocumentId", () => {
    it("returns branded DocumentId for valid input", () => {
      const id: DocumentId = toDocumentId(validUuid);
      expect(id).toBe(validUuid);
    });

    it("throws error for invalid input", () => {
      expect(() => toDocumentId("not-a-uuid")).toThrow("Invalid document ID");
      expect(() => toDocumentId("")).toThrow("Invalid document ID");
    });
  });

  describe("tryToDocumentId", () => {
    it("returns DocumentId for valid input", () => {
      const result = tryToDocumentId(validUuid);
      expect(result).toBe(validUuid);
    });

    it("returns null for invalid input", () => {
      expect(tryToDocumentId("not-a-uuid")).toBeNull();
      expect(tryToDocumentId("")).toBeNull();
    });
  });
});

// =============================================================================
// Email Tests
// =============================================================================

describe("Email branded type", () => {
  describe("isValidEmail", () => {
    it("accepts valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name@example.com")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
      expect(isValidEmail("user@subdomain.example.com")).toBe(true);
    });

    it("rejects emails without @", () => {
      expect(isValidEmail("userexample.com")).toBe(false);
    });

    it("rejects emails without domain", () => {
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
    });

    it("rejects emails without TLD", () => {
      expect(isValidEmail("user@example")).toBe(false);
    });

    it("rejects emails with spaces", () => {
      expect(isValidEmail("user @example.com")).toBe(false);
      expect(isValidEmail(" user@example.com")).toBe(false);
      expect(isValidEmail("user@example.com ")).toBe(false);
    });

    it("rejects empty strings", () => {
      expect(isValidEmail("")).toBe(false);
    });

    it("rejects emails over 254 characters", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe("toEmail", () => {
    it("returns branded Email for valid input", () => {
      const email: Email = toEmail("user@example.com");
      expect(email).toBe("user@example.com");
    });

    it("throws error for invalid input", () => {
      expect(() => toEmail("invalid")).toThrow("Invalid email format");
      expect(() => toEmail("")).toThrow("Invalid email format");
    });
  });

  describe("tryToEmail", () => {
    it("returns Email for valid input", () => {
      const result = tryToEmail("user@example.com");
      expect(result).toBe("user@example.com");
    });

    it("returns null for invalid input", () => {
      expect(tryToEmail("invalid")).toBeNull();
      expect(tryToEmail("")).toBeNull();
    });
  });
});

// =============================================================================
// Type Safety Tests (compile-time checks)
// =============================================================================

describe("Type safety", () => {
  it("branded types are assignable to their base types", () => {
    const slug: Slug = toSlug("hello-world");
    const str: string = slug; // Should compile - Slug extends string
    expect(str).toBe("hello-world");

    const id: DocumentId = toDocumentId("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d");
    const str2: string = id; // Should compile - DocumentId extends string
    expect(str2).toBe("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d");
  });

  it("demonstrates type narrowing with type guards", () => {
    const input = "hello-world";

    if (isValidSlug(input)) {
      // TypeScript knows input is Slug here
      const slug: Slug = input;
      expect(slug).toBe("hello-world");
    }
  });

  it("demonstrates safe conversion pattern", () => {
    function processSlug(slug: Slug): string {
      return `Processing: ${slug}`;
    }

    // This pattern shows how to safely use branded types
    const userInput = "hello-world";
    const slug = tryToSlug(userInput);

    if (slug) {
      const result = processSlug(slug);
      expect(result).toBe("Processing: hello-world");
    }
  });
});
