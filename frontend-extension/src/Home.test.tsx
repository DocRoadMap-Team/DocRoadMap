import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import Home from "./Home";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

describe("Home", () => {
  const mockNavigate = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (global as any).chrome = {
      storage: {
        local: {
          get: mockGet,
        },
      },
    };
  });

  it("renders login and signup buttons", () => {
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    expect(screen.getByText("login")).toBeInTheDocument();
    expect(screen.getByText("signup")).toBeInTheDocument();
  });

  it("navigates to /login when login button is clicked", () => {
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    fireEvent.click(screen.getByText("login"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to /register when register button is clicked", () => {
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    fireEvent.click(screen.getByText("signup"));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("redirects to /roadmap if token exists", async () => {
    mockGet.mockImplementation((_key: string, cb: any) =>
      cb({ token: "abc123" }),
    );
    render(<Home />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/docroadmap");
    });
  });
});
