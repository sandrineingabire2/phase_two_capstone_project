import { render, screen } from "@testing-library/react";
import ProjectsPage from "@/app/projects/page";

describe("ProjectsPage", () => {
  it("lists sample projects", () => {
    render(<ProjectsPage />);
    expect(screen.getByText(/Content Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile Toolkit/i)).toBeInTheDocument();
  });
});
