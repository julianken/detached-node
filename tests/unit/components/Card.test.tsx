import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";

describe("Card", () => {
  it("renders children content", () => {
    render(<Card>Test content</Card>);

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders as a div when no href is provided", () => {
    render(<Card>Content</Card>);

    // Should not be a link
    expect(screen.queryByRole("link")).toBeNull();
    // The content should be in a div
    expect(screen.getByText("Content").tagName).toBe("DIV");
  });

  it("renders as a link when href is provided", () => {
    render(<Card href="/test-link">Link content</Card>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test-link");
    expect(link).toHaveTextContent("Link content");
  });

  it("applies base styling classes", () => {
    render(<Card>Styled content</Card>);

    const card = screen.getByText("Styled content");
    expect(card).toHaveClass("relative");
    expect(card).toHaveClass("block");
    expect(card).toHaveClass("transition-colors");
    expect(card).toHaveClass("focus-ring");
  });

  it("applies base styling classes to links", () => {
    render(<Card href="/test">Link</Card>);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("relative");
    expect(link).toHaveClass("block");
    expect(link).toHaveClass("transition-colors");
    expect(link).toHaveClass("focus-ring");
  });

  it("merges custom className with base styles", () => {
    render(<Card className="custom-class another-class">Content</Card>);

    const card = screen.getByText("Content");
    expect(card).toHaveClass("relative"); // base style
    expect(card).toHaveClass("custom-class"); // custom class
    expect(card).toHaveClass("another-class"); // custom class
  });

  it("handles empty className gracefully", () => {
    render(<Card className="">Content</Card>);

    const card = screen.getByText("Content");
    expect(card).toHaveClass("relative");
  });

  it("renders complex children correctly", () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Title"
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("preserves children structure in link mode", () => {
    render(
      <Card href="/test">
        <span data-testid="child">Nested content</span>
      </Card>
    );

    const child = screen.getByTestId("child");
    expect(child.parentElement).toBe(screen.getByRole("link"));
  });

  it("applies hover styling classes", () => {
    render(<Card>Hover test</Card>);

    const card = screen.getByText("Hover test");
    expect(card.className).toContain("hover:");
  });
});
