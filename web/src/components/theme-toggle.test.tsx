// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const themeMock = vi.hoisted(() => ({
  resolvedTheme: "light",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => themeMock,
}));

import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  afterEach(cleanup);

  beforeEach(() => {
    themeMock.resolvedTheme = "light";
    themeMock.setTheme.mockClear();
  });

  it("changes from the default light theme to dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Alternar tema claro e escuro" }),
    );

    expect(themeMock.setTheme).toHaveBeenCalledWith("dark");
  });

  it("changes a persisted dark theme back to light", async () => {
    themeMock.resolvedTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", {
      name: "Alternar tema claro e escuro",
    });

    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    await user.click(toggle);

    expect(themeMock.setTheme).toHaveBeenCalledWith("light");
  });
});
