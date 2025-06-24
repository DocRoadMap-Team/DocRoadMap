import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfileCard from "@/app/(tabs)/profile";
import UserContext from "@/constants/Context";
import { ThemeProvider } from "@/components/ThemeContext";
import * as router from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nextProvider } from "react-i18next";
import i18n from "@/locales/ii8n";

jest.mock("@/constants/Request", () => ({
  infoProfile: jest.fn(() =>
    Promise.resolve({
      data: {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
      },
    }),
  ),
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("ProfileCard", () => {
  const setUserMock = jest.fn();

  const renderComponent = () =>
    render(
      <ThemeProvider>
        <UserContext.Provider value={{ user: {}, setUser: setUserMock }}>
          <I18nextProvider i18n={i18n}>
            <ProfileCard />
          </I18nextProvider>
        </UserContext.Provider>
      </ThemeProvider>,
    );

  it("affiche les infos utilisateur récupérées depuis infoProfile()", async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText("John Doe")).toBeTruthy();
      expect(getByText(/john\.doe@example\.com/i)).toBeTruthy();
    });
  });
});
