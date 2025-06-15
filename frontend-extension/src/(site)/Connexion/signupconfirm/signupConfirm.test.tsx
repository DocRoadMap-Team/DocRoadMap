import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignupConfirm from "./signupConfirm";

const mockNavigate = jest.fn();
const mockAlert = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

global.alert = mockAlert;

describe("SignupConfirm component", () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <SignupConfirm />
      </MemoryRouter>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders confirmation message and buttons", () => {
    renderWithRouter();
    expect(screen.getByText("instruction")).toBeInTheDocument();
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("calls navigate on login button click", () => {
    renderWithRouter();
    fireEvent.click(screen.getByText("login"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
