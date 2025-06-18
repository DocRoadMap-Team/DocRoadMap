import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";

const mockNavigate = jest.fn();
const mockChangeLanguage = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LanguageSelector component", () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <LanguageSelector />
      </MemoryRouter>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and all flag images", () => {
    renderWithRouter();
    expect(screen.getByText("languageTitle")).toBeInTheDocument();
    expect(screen.getByAltText("French flag")).toBeInTheDocument();
    expect(screen.getByAltText("English flag")).toBeInTheDocument();
    expect(screen.getByAltText("Spanish flag")).toBeInTheDocument();
  });

  it("changes language and navigates back when French flag button is clicked", () => {
    renderWithRouter();
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(mockChangeLanguage).toHaveBeenCalledWith("fr");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("changes language and navigates back when English flag button is clicked", () => {
    renderWithRouter();
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);
    expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("changes language and navigates back when Spanish flag button is clicked", () => {
    renderWithRouter();
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);
    expect(mockChangeLanguage).toHaveBeenCalledWith("es");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates back when back button is clicked", () => {
    renderWithRouter();
    const backButton = screen.getAllByRole("button")[0];
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
