// jest.setup.js
// Add FormData polyfill for React Native/Expo testing
global.FormData = require("form-data");

// Mock Expo Font
jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Expo Asset
jest.mock("expo-asset", () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      localUri: "mocked-uri",
      downloadAsync: jest.fn(() => Promise.resolve({ uri: "mocked-uri" })),
    })),
  },
}));
// Mock Expo Vector Icons
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return {
    Ionicons: View,
    MaterialIcons: View,
    FontAwesome: View,
    AntDesign: View,
    Entypo: View,
    EvilIcons: View,
    Feather: View,
    Foundation: View,
    MaterialCommunityIcons: View,
    Octicons: View,
    SimpleLineIcons: View,
    Zocial: View,
  };
});

// Mock Expo modules that might cause issues
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      name: "test-app",
      slug: "test-app",
    },
  },
}));

jest.mock("expo-localization", () => ({
  locale: "en-US",
  locales: ["en-US"],
  timezone: "America/New_York",
  isoCurrencyCodes: ["USD"],
  region: "US",
  getLocales: () => [
    { languageTag: "en-US", languageCode: "en", regionCode: "US" },
  ],
}));

// Setup testing library
import "@testing-library/jest-native/extend-expect";
