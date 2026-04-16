import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/PageHeader";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Test Title" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders title as h1 heading", () => {
    render(<PageHeader title="Main Title" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Main Title");
  });

  it("renders subtitle when provided", () => {
    render(
      <PageHeader title="Title" subtitle="This is a subtitle description" />
    );

    expect(
      screen.getByText("This is a subtitle description")
    ).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<PageHeader title="Title Only" />);

    // Should only have the heading, no paragraph
    const container = screen.getByRole("banner");
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("wraps content in a header element", () => {
    render(<PageHeader title="Test" />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("applies correct heading styling", () => {
    render(<PageHeader title="Styled Title" />);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass("text-3xl");
    expect(heading).toHaveClass("font-semibold");
    expect(heading).toHaveClass("tracking-tight");
  });

  it("applies correct subtitle styling when present", () => {
    render(<PageHeader title="Title" subtitle="Subtitle text" />);

    const subtitle = screen.getByText("Subtitle text");
    expect(subtitle).toHaveClass("mt-2");
    expect(subtitle).toHaveClass("text-base");
  });

  it("handles special characters in title", () => {
    render(<PageHeader title='Title with "Quotes" & Symbols' />);

    expect(
      screen.getByText('Title with "Quotes" & Symbols')
    ).toBeInTheDocument();
  });

  it("handles special characters in subtitle", () => {
    render(
      <PageHeader title="Title" subtitle="Subtitle with © and ™ symbols" />
    );

    expect(
      screen.getByText("Subtitle with © and ™ symbols")
    ).toBeInTheDocument();
  });

  it("renders long subtitle correctly", () => {
    const longSubtitle =
      "This is a very long subtitle that provides detailed context about the page content and might span multiple lines in the UI.";
    render(<PageHeader title="Title" subtitle={longSubtitle} />);

    expect(screen.getByText(longSubtitle)).toBeInTheDocument();
  });
});
