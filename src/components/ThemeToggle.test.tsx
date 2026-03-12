import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ThemeToggle from "./ThemeToggle";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}));

describe("ThemeToggle", () => {
  it("renders a theme toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });
});
