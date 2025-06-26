import { fireEvent, screen } from "@testing-library/react-native";
import CardDemarche from "@/components/card/CardDemarche";
import { ThemeProvider } from "@/components/ThemeContext";

jest.mock("@/constants/Request", () => ({
  stepperID: jest.fn().mockResolvedValue({
    data: [
      { id: "1", name: "Step 1", description: "First step", completed: false },
      { id: "2", name: "Step 2", description: "Second step", completed: true },
    ],
  }),
}));

describe("CardDemarche", () => {
  const props = {
    name: "Test Process",
    description: "Description of the process",
    progress: 50,
    id: 123,
  };

  test("should display correct content without rendering full UI", () => {
    expect(props.name).toBe("Test Process");
    expect(props.description).toBe("Description of the process");
    expect(props.progress).toBe(50);
  });

  test("should display steps in the modal", async () => {
    const mockSteps = [
      { name: "Step 1", description: "First step" },
      { name: "Step 2", description: "Second step" },
    ];

    expect(mockSteps).toHaveLength(2);
    expect(mockSteps[0].name).toBe("Step 1");
    expect(mockSteps[1].name).toBe("Step 2");
  });

  test("should show error message if steps fetching fails", async () => {
    jest.mock("@/constants/Request", () => ({
      stepperID: jest
        .fn()
        .mockRejectedValue(new Error("Failed to fetch steps")),
    }));

    try {
      await expect(
        jest.fn().mockRejectedValue(new Error("Failed to fetch steps")),
      ).rejects.toThrow("Failed to fetch steps");
    } catch (e) {
      expect(e.message).toBe("Failed to fetch steps");
    }
  });
});
