import { describe, it, expect } from "vitest";
import { formatDate, getTypeLabel, typeLabels } from "@/lib/formatting";

describe("formatDate", () => {
  it("returns empty string for null input", () => {
    expect(formatDate(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(formatDate("")).toBe("");
  });

  it("formats ISO date string correctly", () => {
    // Use a datetime in the middle of the day to avoid timezone edge cases
    const result = formatDate("2026-01-15T12:00:00.000Z");
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("formats ISO datetime string correctly", () => {
    const result = formatDate("2026-01-15T10:30:00.000Z");
    // Note: exact output depends on timezone, but should contain the date parts
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
  });

  it("handles different months correctly", () => {
    // Use midday times to avoid timezone edge cases
    const june = formatDate("2026-06-15T12:00:00.000Z");
    expect(june).toContain("Jun");
    expect(june).toContain("2026");

    const december = formatDate("2026-12-25T12:00:00.000Z");
    expect(december).toContain("Dec");
    expect(december).toContain("25");
    expect(december).toContain("2026");
  });

  it("uses en-US locale formatting", () => {
    // en-US short format: Mon Day, Year
    const result = formatDate("2026-03-15");
    expect(result).toMatch(/Mar \d+, 2026/);
  });
});

describe("typeLabels", () => {
  it("contains all expected post types", () => {
    expect(typeLabels).toHaveProperty("essay");
    expect(typeLabels).toHaveProperty("decoder");
    expect(typeLabels).toHaveProperty("index");
  });

  it("has correct label values", () => {
    expect(typeLabels.essay).toBe("Essay");
    expect(typeLabels.decoder).toBe("Decoder");
    expect(typeLabels.index).toBe("Index");
  });
});

describe("getTypeLabel", () => {
  it("returns correct label for essay", () => {
    expect(getTypeLabel("essay")).toBe("Essay");
  });

  it("returns correct label for decoder", () => {
    expect(getTypeLabel("decoder")).toBe("Decoder");
  });

  it("returns correct label for index", () => {
    expect(getTypeLabel("index")).toBe("Index");
  });

  it("returns empty string for unknown type", () => {
    expect(getTypeLabel("unknown-type")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(getTypeLabel("")).toBe("");
  });
});
