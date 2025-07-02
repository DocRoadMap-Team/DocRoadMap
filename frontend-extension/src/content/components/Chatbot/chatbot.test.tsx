import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import Chatbot from "./chatbot";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock("../../utils/utils", () => ({
  __esModule: true,
  default: jest.fn(() => "token123"),
}));

describe("Chatbot component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it("renders static content", () => {
    render(<Chatbot />);
    expect(
      screen.getByText((text) => text.includes("Donna"))
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("questionchatbot")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not send empty message", () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("user")).not.toBeInTheDocument();
  });
});
