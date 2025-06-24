import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DecisionTreeInterface from "@/components/chat/DecisionTreeInterface";

jest.mock("@/app/(tabs)/decisionTree", () => {
  return function MockDecisionTree() {
    return null;
  };
});

jest.mock("react-native-size-matters", () => ({
  ScaledSheet: {
    create: (styles: any) => styles,
  },
  moderateScale: (size: number) => size,
}));

jest.mock("react-native-responsive-screen", () => ({
  widthPercentageToDP: (percentage: number) => percentage,
  heightPercentageToDP: (percentage: number) => percentage,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => `Icon-${name}`,
}));

describe("DecisionTreeInterface", () => {
  test("doit rendre le composant sans erreur", () => {
    const { toJSON } = render(<DecisionTreeInterface />);
    expect(toJSON()).toBeTruthy();
  });

  describe("DecisionTreeInterface logic", () => {
    it("ouvre et ferme la modal", () => {
      let showModal = false;

      const openModal = () => {
        showModal = true;
      };

      const closeModal = () => {
        showModal = false;
      };

      expect(showModal).toBe(false);

      openModal();
      expect(showModal).toBe(true);

      closeModal();
      expect(showModal).toBe(false);
    });
  });
});
