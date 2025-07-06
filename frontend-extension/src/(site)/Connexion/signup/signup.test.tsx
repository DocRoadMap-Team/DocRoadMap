import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import Signup from "./signup";

jest.mock("axios");

interface UseTranslationResult {
  t: (key: string) => string;
}

interface ReactI18NextMock {
  useTranslation: () => UseTranslationResult;
}

jest.mock(
  "react-i18next",
  (): ReactI18NextMock => ({
    useTranslation: (): UseTranslationResult => ({
      t: (key: string): string => key,
    }),
  }),
);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("Signup Component", () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders step 1 correctly", () => {
    renderWithRouter();
    expect(screen.getByPlaceholderText("firstName")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("lastName")).toBeInTheDocument();
    expect(screen.getByText("continue")).toBeInTheDocument();
  });

  it("proceeds to step 2 when continue is clicked on step 1", () => {
    renderWithRouter();
    fireEvent.change(screen.getByPlaceholderText("firstName"), {
      target: { value: "Evan" },
    });
    fireEvent.change(screen.getByPlaceholderText("lastName"), {
      target: { value: "Lab" },
    });
    fireEvent.click(screen.getByText("continue"));
    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
  });

  it("proceeds to step 3 when continue is clicked on step 2", () => {
    renderWithRouter();
    fireEvent.change(screen.getByPlaceholderText("firstName"), {
      target: { value: "Evan" },
    });
    fireEvent.change(screen.getByPlaceholderText("lastName"), {
      target: { value: "Lab" },
    });
    fireEvent.click(screen.getByText("continue"));
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "evanLab@outlook.com" },
    });
    fireEvent.click(screen.getByText("continue"));
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("confirmPassword")).toBeInTheDocument();
  });

  it("submits the form successfully if passwords match on step 3", async () => {
    (axios.post as jest.Mock).mockResolvedValue({});

    renderWithRouter();
    fireEvent.change(screen.getByPlaceholderText("firstName"), {
      target: { value: "Evan" },
    });
    fireEvent.change(screen.getByPlaceholderText("lastName"), {
      target: { value: "Lab" },
    });
    fireEvent.click(screen.getByText("continue"));
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "evanLab@outlook.com" },
    });
    fireEvent.click(screen.getByText("continue"));
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "1234" },
    });
    fireEvent.change(screen.getByPlaceholderText("confirmPassword"), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByText("submit"));

    expect(axios.post).toHaveBeenCalledWith(
      "https://www.docroadmap.fr/auth/register",
      {
        firstName: "Evan",
        lastName: "Lab",
        email: "evanLab@outlook.com",
        password: "1234",
      },
    );
  });
});
