import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/PostCard";

describe("PostCard", () => {
  const defaultProps = {
    title: "Test Post Title",
    summary: "This is a test summary for the post.",
    href: "/posts/test-post",
  };

  it("renders the title", () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
  });

  it("renders the summary", () => {
    render(<PostCard {...defaultProps} />);

    expect(
      screen.getByText("This is a test summary for the post.")
    ).toBeInTheDocument();
  });

  it("renders as a link with correct href", () => {
    render(<PostCard {...defaultProps} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/posts/test-post");
  });

  it("renders date when provided", () => {
    render(<PostCard {...defaultProps} date="January 15, 2026" />);

    expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
  });

  it("does not render date when not provided", () => {
    render(<PostCard {...defaultProps} />);

    // The date container should not contain any date text
    const link = screen.getByRole("link");
    expect(link.querySelector(".text-xs")).toBeNull();
  });

  it("applies correct styling classes", () => {
    render(<PostCard {...defaultProps} />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("rounded-xl");
    expect(link).toHaveClass("border");
    expect(link).toHaveClass("transition");
  });

  it("title has correct heading semantics", () => {
    render(<PostCard {...defaultProps} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Test Post Title");
  });

  it("handles long titles gracefully", () => {
    const longTitle =
      "This is an extremely long title that might wrap to multiple lines in the UI";
    render(<PostCard {...defaultProps} title={longTitle} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it("handles special characters in content", () => {
    render(
      <PostCard
        {...defaultProps}
        title='Post with "Quotes" & <Brackets>'
        summary="Summary with special chars: © ™ ®"
      />
    );

    expect(
      screen.getByText('Post with "Quotes" & <Brackets>')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Summary with special chars: © ™ ®")
    ).toBeInTheDocument();
  });
});
