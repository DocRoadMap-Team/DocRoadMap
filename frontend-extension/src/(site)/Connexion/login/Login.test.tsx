import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./login";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

describe("Login component", () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

  it("renders login page correctly", () => {
    renderWithRouter();
    expect(screen.getByPlaceholderText("emailPlaceholder")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("passwordPlaceholder"),
    ).toBeInTheDocument();
    expect(screen.getByText("login")).toBeInTheDocument();
  });
});
