import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DecisionTreeChat from "./decisionTree";
// import rawData from "./decisionTree.json";
import axios from "axios";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

jest.mock("axios");
jest.mock("../../utils/utils");

jest.mock("./decisionTree.json", () => ({
  start: {
    question: "What do you want to do?",
    options: [
      { label: "Demarche", next: "dem_answers" },
      { label: "Logement", next: "aide_logement_answers" },
    ],
  },
  dem_answers: {
    step1: {
      step_title: "Step 1",
      step_question: "start",
      status: "mandatory",
      options: [{ label: "Demarche", answer: "Do step 1" }],
    },
  },
}));

describe("DecisionTreeChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getToken as jest.Mock).mockResolvedValue("mock-token");
    (axios.get as jest.Mock).mockResolvedValue({ data: { id: "user-123" } });
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: "process-456" },
    });
  });

  it("renders the initial question", async () => {
    render(<DecisionTreeChat />);

    await waitFor(() =>
      expect(screen.getByText("What do you want to do?")).toBeInTheDocument(),
    );

    expect(
      screen.getByRole("button", { name: /Demarche/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Logement/i }),
    ).toBeInTheDocument();
  });

  it("shows user answer and steps after selecting an option", async () => {
    render(<DecisionTreeChat />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Demarche/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Demarche/i }));

    expect(await screen.findByText("Demarche")).toBeInTheDocument();
    expect(await screen.findByText(/Étapes à suivre/)).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Do step 1")).toBeInTheDocument();
  });

  it("calls API to fetch user and create process/steps", async () => {
    render(<DecisionTreeChat />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Demarche/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Demarche/i }));

    await waitFor(() => {
      expect(getToken).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${backendUrl}/users/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        }),
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${backendUrl}/process/create`,
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        }),
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${backendUrl}/steps/create`,
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        }),
      );
    });
  });

  it("restarts the chat when the restart button is clicked", async () => {
    render(<DecisionTreeChat />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Demarche/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Demarche/i }));

    expect(await screen.findByText(/Étapes à suivre/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Recommencer/i }));
    expect(
      await screen.findByText("What do you want to do?"),
    ).toBeInTheDocument();
  });

  it("renders and handles the close button if provided", async () => {
    const onClose = jest.fn();
    render(<DecisionTreeChat onClose={onClose} />);

    await waitFor(() =>
      expect(screen.getByLabelText("Fermer")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText("Fermer"));
    expect(onClose).toHaveBeenCalled();
  });
});
