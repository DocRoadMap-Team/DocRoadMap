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
      tabs: {
        query: jest.fn((_, cb) => cb([{ url: "https://www.ameli.fr" }])),
      },
      storage: {
        local: {
          get: mockGet,
        },
      },
    };
  });

  it("renders login and signup buttons if URL is authorized and no token", async () => {
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("login")).toBeInTheDocument();
      expect(screen.getByText("signup")).toBeInTheDocument();
    });
  });

  it("navigates to /login when login button is clicked", async () => {
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    await waitFor(() => fireEvent.click(screen.getByText("login")));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to /signup when signup button is clicked", async () => {
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    await waitFor(() => fireEvent.click(screen.getByText("signup")));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("redirects to /docroadmap if token exists", async () => {
    mockGet.mockImplementation((_key: string, cb: any) =>
      cb({ token: "abc123" }),
    );
    render(<Home />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/docroadmap");
    });
  });

  it("displays not authorized message when URL is not authorized", async () => {
    (global as any).chrome.tabs.query = jest.fn((_, cb) =>
      cb([{ url: "https://www.google.com" }]),
    );
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("Not-authorized-for-DocRoadMap"),
      ).toBeInTheDocument();
    });
  });

  it("falls back to localStorage when chrome.storage is undefined", async () => {
    delete (global as any).chrome.storage;
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockReturnValue("localToken");
    render(<Home />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/docroadmap");
    });
  });

  it("handles missing chrome.tabs gracefully", async () => {
    delete (global as any).chrome.tabs;
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("login")).toBeInTheDocument();
    });
  });

  it("handles null URL returned from chrome.tabs", async () => {
    (global as any).chrome.tabs.query = jest.fn((_, cb) => cb([{ url: null }]));
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));

    render(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("Not-authorized-for-DocRoadMap"),
      ).toBeInTheDocument();
    });
  });

  it("returns false for invalid URL (throws in URL constructor)", async () => {
    (global as any).chrome.tabs.query = jest.fn((_, cb) =>
      cb([{ url: "invalid:url" }]),
    );
    mockGet.mockImplementation((_key: string, cb: any) => cb({}));
    render(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("Not-authorized-for-DocRoadMap"),
      ).toBeInTheDocument();
    });
  });
});
