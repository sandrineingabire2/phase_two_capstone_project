import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";

describe("ThemeToggle", () => {
  it("toggles between light and dark labels", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    const initialLabel = button.textContent;
    fireEvent.click(button);
    expect(button.textContent).not.toBe(initialLabel);
  });
});
