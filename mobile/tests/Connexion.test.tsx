import {
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import ConnectionPage from "@/app/(tabs)/connexion";
import { useRouter } from "expo-router";
import request from "@/constants/Request";
import { useTranslation } from "react-i18next";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/constants/Request", () => ({
  login: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

global.alert = jest.fn();

describe("ConnectionPage Component", () => {
  const mockReplace = jest.fn();
  const mockPush = jest.fn();
  const mockT = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush, replace: mockReplace });
    useTranslation.mockReturnValue({ t: mockT });
    request.login.mockClear();
    global.alert.mockClear();
  });

  test("renders all input fields and buttons", () => {
    mockT.mockImplementation((key) => key);

    render(<ConnectionPage />);

    expect(
      screen.getByPlaceholderText("connexion.emailPlaceholder"),
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText("connexion.passwordPlaceholder"),
    ).toBeTruthy();
    expect(screen.getByText("connexion.loginButton")).toBeTruthy();
    expect(screen.getByText("connexion.forgotPassword")).toBeTruthy();
    expect(screen.getByText("connexion.createAccount")).toBeTruthy();
  });

  test("successful login clears input fields and navigates to home", async () => {
    mockT.mockImplementation((key) => key);
    request.login.mockResolvedValueOnce({});

    render(<ConnectionPage />);

    fireEvent.changeText(
      screen.getByPlaceholderText("connexion.emailPlaceholder"),
      "john.doe@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("connexion.passwordPlaceholder"),
      "password123",
    );

    fireEvent.press(screen.getByText("connexion.loginButton"));

    await waitFor(() => {
      expect(request.login).toHaveBeenCalledWith({
        email: "john.doe@example.com",
        password: "password123",
      });
    });

    expect(
      screen.getByPlaceholderText("connexion.emailPlaceholder").props.value,
    ).toBe("");
    expect(
      screen.getByPlaceholderText("connexion.passwordPlaceholder").props.value,
    ).toBe("");
    expect(mockReplace).toHaveBeenCalledWith("/home");
  });

  test("navigates to forgot password page on link press", () => {
    mockT.mockImplementation((key) => key);

    render(<ConnectionPage />);

    fireEvent.press(screen.getByText("connexion.forgotPassword"));

    expect(mockPush).toHaveBeenCalledWith("/forgottenPassword");
  });

  test("navigates to register page on create account link press", () => {
    mockT.mockImplementation((key) => key);

    render(<ConnectionPage />);

    fireEvent.press(screen.getByText("connexion.createAccount"));

    expect(mockPush).toHaveBeenCalledWith("/register");
  });
});
