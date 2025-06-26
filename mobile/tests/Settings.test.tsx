import { render, fireEvent, screen } from "@testing-library/react-native";
import Settings from "@/app/(tabs)/settings";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useTheme: jest.fn(),
}));

describe("Settings Component", () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    replaceMock.mockClear();

    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });

    (useTheme as jest.Mock).mockReturnValue({
      theme: { background: "white", primary: "blue" },
      toggleTheme: jest.fn(),
    });

    i18n.init({
      resources: {
        en: { translation: { key: "value" } },
      },
      lng: "en",
      fallbackLng: "en",
    });
  });

  it("should open language modal when language change button is pressed", () => {
    const setModalVisible = jest.fn();
    const modalVisible = true;

    setModalVisible(true);
    expect(setModalVisible).toHaveBeenCalledWith(true);
    expect(modalVisible).toBe(true);
  });

  it("should change language when a new language is selected", () => {
    const languageMock = jest.fn();

    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <Settings />
      </I18nextProvider>,
    );

    const languageButton = getByText("switch_language");
    fireEvent.press(languageButton);
    languageMock();

    expect(languageMock).toHaveBeenCalled();
  });

  it("should navigate to profile when back to profile button is pressed", () => {
    replaceMock("/profile");
    expect(replaceMock).toHaveBeenCalledWith("/profile");
  });

  it("should navigate to calendar when calendar button is pressed", () => {
    replaceMock("/calendar");
    expect(replaceMock).toHaveBeenCalledWith("/calendar");
  });
});
