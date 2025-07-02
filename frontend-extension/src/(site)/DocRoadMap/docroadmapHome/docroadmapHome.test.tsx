import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocroadmapHome from "./docroadmapHome";

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

const mockNavigate = jest.fn();

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

describe("DocroadmapHome component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "test");
    sessionStorage.setItem("something", "test");

    global.chrome = {
      tabs: {
        query: jest.fn((_, cb) => cb([{ url: "https://www.ameli.fr" }])), // URL autorisée par défaut
      },
      storage: {
        local: {
          remove: jest.fn((_key, callback) => callback && callback()),
        },
      },
    } as any;
  });

  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <DocroadmapHome />
      </MemoryRouter>
    );

  it("renders translated texts", async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText("settings")).toBeInTheDocument();
      expect(screen.getByText("profile")).toBeInTheDocument();
      expect(screen.getByText("language")).toBeInTheDocument();
      expect(screen.getByText("logout")).toBeInTheDocument();
    });
  });

  it("navigates to profile when profile button is clicked", async () => {
    renderWithRouter();
    fireEvent.click(await screen.findByText("profile"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("navigates to language when language button is clicked", async () => {
    renderWithRouter();
    fireEvent.click(await screen.findByText("language"));
    expect(mockNavigate).toHaveBeenCalledWith("/language");
  });

  it("clears storage and navigates to root on logout", async () => {
    renderWithRouter();
    fireEvent.click(await screen.findByText("logout"));
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
      expect(sessionStorage.getItem("something")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
