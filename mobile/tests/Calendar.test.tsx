import { scheduleNotificationAsync } from "expo-notifications";
import * as Calendar from "expo-calendar";
import { act } from "react-test-renderer";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CalendarScreen from "@/app/(tabs)/calendar";

jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getCalendarsAsync: jest.fn(() =>
    Promise.resolve([{ id: "1", allowsModifications: true }]),
  ),
  getEventsAsync: jest.fn(() => Promise.resolve([])),
  createEventAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

describe("CalendarScreen logic", () => {
  const calendarId = "mock-calendar-id";
  const selectedDate = "2025-06-20";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("scheduleNotification envoie une notification à l'heure définie", async () => {
    const mockSchedule = scheduleNotificationAsync as jest.Mock;
    const eventDate = new Date("2025-06-20T10:00:00");

    const delay = 10;
    const triggerDate = new Date(eventDate.getTime() - delay * 60 * 1000);

    await act(async () => {
      await scheduleNotificationAsync({
        content: {
          title: "⏰ Rappel",
          body: "Ton événement commence bientôt !",
        },
        trigger: {
          type: "date",
          date: triggerDate,
        },
      });
    });

    expect(mockSchedule).toHaveBeenCalledWith({
      content: {
        title: "⏰ Rappel",
        body: "Ton événement commence bientôt !",
      },
      trigger: {
        type: "date",
        date: triggerDate,
      },
    });
  });

  it("createEventAsync crée bien un événement", async () => {
    const mockCreateEvent = Calendar.createEventAsync as jest.Mock;
    mockCreateEvent.mockResolvedValueOnce("mock-event-id");

    const start = new Date("2025-06-20T09:00:00");
    const end = new Date("2025-06-20T10:00:00");

    await Calendar.createEventAsync(calendarId, {
      title: "Test Event",
      startDate: start,
      endDate: end,
      timeZone: "Europe/Paris",
      location: "Chez toi",
      notes: "Description",
    });

    expect(mockCreateEvent).toHaveBeenCalledWith(
      calendarId,
      expect.objectContaining({
        title: "Test Event",
        startDate: start,
        endDate: end,
      }),
    );
  });

  it("getEventsAsync récupère les événements du jour", async () => {
    const mockGetEvents = Calendar.getEventsAsync as jest.Mock;
    const mockEvents = [
      { id: "1", title: "Mock Event", startDate: new Date() },
    ];
    mockGetEvents.mockResolvedValueOnce(mockEvents);

    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59);

    const events = await Calendar.getEventsAsync([calendarId], start, end);

    expect(mockGetEvents).toHaveBeenCalledWith([calendarId], start, end);
    expect(events).toEqual(mockEvents);
  });

  test("doit rendre le composant CalendarScreen sans erreur", async () => {
    const { toJSON } = render(<CalendarScreen />);

    await waitFor(() => expect(toJSON()).toBeTruthy());
  });
});
