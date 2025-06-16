import {
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import Register from "@/app/(tabs)/register";
import { useRouter } from "expo-router";
import request from "@/constants/Request";
import { useTranslation } from "react-i18next";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/constants/Request", () => ({
  register: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

global.alert = jest.fn();

describe("Register Component", () => {
  const mockReplace = jest.fn();
  const mockT = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ replace: mockReplace });
    useTranslation.mockReturnValue({ t: mockT });
    request.register.mockClear();
    global.alert.mockClear();
  });

  test("renders all input fields and buttons", () => {
    mockT.mockImplementation((key) => key);

    render(<Register />);

    expect(screen.getByPlaceholderText("register.firstname")).toBeTruthy();
    expect(screen.getByPlaceholderText("register.lastname")).toBeTruthy();
    expect(screen.getByPlaceholderText("register.email")).toBeTruthy();
    expect(screen.getByPlaceholderText("register.password")).toBeTruthy();

    expect(screen.getByText("register.create_account")).toBeTruthy();
    expect(screen.getByText("register.back_to_home")).toBeTruthy();
  });

  test("successful registration clears input fields", async () => {
    mockT.mockImplementation((key) => key);
    request.register.mockResolvedValueOnce({});

    render(<Register />);

    fireEvent.changeText(
      screen.getByPlaceholderText("register.firstname"),
      "John",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("register.lastname"),
      "Doe",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("register.email"),
      "john.doe@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("register.password"),
      "password123",
    );

    fireEvent.press(screen.getByText("register.create_account"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("register.firstname").props.value,
      ).toBe("");
      expect(screen.getByPlaceholderText("register.lastname").props.value).toBe(
        "",
      );
      expect(screen.getByPlaceholderText("register.email").props.value).toBe(
        "",
      );
      expect(screen.getByPlaceholderText("register.password").props.value).toBe(
        "",
      );
    });
  });

  test("calls router.replace on back button press", () => {
    mockT.mockImplementation((key) => key);

    render(<Register />);

    fireEvent.press(screen.getByText("register.back_to_home"));

    expect(mockReplace).toHaveBeenCalledWith("/connexion");
  });

  test("submits registration data and creates account successfully", async () => {
    mockT.mockImplementation((key) => key);
    request.register.mockResolvedValueOnce({});

    render(<Register />);

    fireEvent.changeText(
      screen.getByPlaceholderText("register.firstname"),
      "Alice",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("register.lastname"),
      "Smith",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("register.email"),
      "alice.smith@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("register.password"),
      "securepassword",
    );

    fireEvent.press(screen.getByText("register.create_account"));

    await waitFor(() => {
      expect(request.register).toHaveBeenCalledWith({
        firstName: "Alice",
        lastName: "Smith",
        email: "alice.smith@example.com",
        password: "securepassword",
      });
    });

    expect(screen.getByPlaceholderText("register.firstname").props.value).toBe(
      "",
    );
    expect(screen.getByPlaceholderText("register.lastname").props.value).toBe(
      "",
    );
    expect(screen.getByPlaceholderText("register.email").props.value).toBe("");
    expect(screen.getByPlaceholderText("register.password").props.value).toBe(
      "",
    );
  });
});
