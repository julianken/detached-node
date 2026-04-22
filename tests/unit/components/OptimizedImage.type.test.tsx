import { describe, it, expect } from "vitest";
import { OptimizedImage } from "@/components/OptimizedImage";

describe("OptimizedImage type contract", () => {
  it("accepts fill mode without dimensions", () => {
    const _el = <OptimizedImage fill src="/a.png" alt="alt" />;
    expect(_el).toBeDefined();
  });

  it("accepts explicit dimensions without fill", () => {
    const _el = <OptimizedImage src="/a.png" alt="alt" width={100} height={100} />;
    expect(_el).toBeDefined();
  });

  it("type-level: rejects fill + explicit dimensions", () => {
    // @ts-expect-error — fill=true disallows width/height
    const _el = <OptimizedImage fill src="/a.png" alt="alt" width={100} height={100} />;
    expect(_el).toBeDefined();
  });

  it("type-level: rejects neither fill nor dimensions", () => {
    // @ts-expect-error — must provide either fill OR width+height
    const _el = <OptimizedImage src="/a.png" alt="alt" />;
    expect(_el).toBeDefined();
  });
});
