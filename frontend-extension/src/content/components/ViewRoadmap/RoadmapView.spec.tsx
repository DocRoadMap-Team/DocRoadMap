import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const fakeTranslations: Record<string, string> = {
        currentRoadmaps: "Mes démarches en cours",
        missingToken: "Token manquant",
        fetchError: "Impossible de récupérer les roadmaps",
        step: "étape",
        validated: "validée",
        continue: "Continuer",
        start: "Continuer",
        update_roadmap: "Modifier la démarche",
        updateEndedAtError: "Erreur lors de la mise à jour",
        fetchStepsError: "Erreur lors du chargement",
        imageAlt: "Illustration démarche",
      };
      return fakeTranslations[key] || key;
    },
  }),
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockGet = jest.fn();

(global as any).chrome = {
  runtime: {
    getURL: jest.fn((path) => path),
  },
  storage: {
    local: {
      get: mockGet,
    },
  },
};

import RoadmapView from "./roadmapView";

describe("RoadmapView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  it("renders the header", async () => {
    mockGet.mockImplementation((_key, cb) => cb({ token: "abc123" }));
    mockedAxios.get.mockResolvedValueOnce({ data: { processes: [] } });

    render(<RoadmapView />);

    expect(screen.getByText(/Mes démarches en cours/i)).toBeInTheDocument();
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());
  });

  it("shows error if token is missing", async () => {
    mockGet.mockImplementation((_key, cb) => cb({}));
    render(<RoadmapView />);
    expect(await screen.findByText(/Token manquant/i)).toBeInTheDocument();
  });

  it("shows error if axios fails", async () => {
    mockGet.mockImplementation((_key, cb) => cb({ token: "abc123" }));
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<RoadmapView />);

    expect(
      await screen.findByText(/Impossible de récupérer les roadmaps/i),
    ).toBeInTheDocument();
  });

  it("renders cards with correct info", async () => {
    mockGet.mockImplementation((_key, cb) => cb({ token: "abc123" }));
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        processes: [
          {
            id: 1,
            name: "Naissance",
            description: "Birth process",
            status: "COMPLETED",
            createdAt: "",
            updatedAt: "",
            steps: [{ status: "DONE" }, { status: "DONE" }, { status: "DONE" }],
          },
          {
            id: 2,
            name: "Emploi",
            description: "Job process",
            status: "IN_PROGRESS",
            createdAt: "",
            updatedAt: "",
            steps: [{ status: "DONE" }, { status: "PENDING" }],
          },
        ],
      },
    });

    render(<RoadmapView />);

    expect(await screen.findByText("Naissance")).toBeInTheDocument();
    expect(screen.getByText("Emploi")).toBeInTheDocument();
    expect(screen.getAllByText("Continuer").length).toBe(2);
  });

  it("renders default image for unknown card name", async () => {
    mockGet.mockImplementation((_key, cb) => cb({ token: "abc123" }));
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        processes: [
          {
            id: 3,
            name: "Inconnu",
            description: "Unknown process",
            status: "PENDING",
            createdAt: "",
            updatedAt: "",
            steps: [],
          },
        ],
      },
    });

    render(<RoadmapView />);
  });
});
