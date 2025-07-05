import axios from "axios";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTranslation } from "react-i18next";
import getToken from "../../utils/utils";
import Header from "../../utils/Header";
import { FaCalendar } from "react-icons/fa";

const env = import.meta.env.VITE_ENV_MODE;
const backendUrl =
  env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

interface Step {
  id: number;
  name: string;
  endedAt: string | null;
}

interface Process {
  id: number;
  name: string;
  steps: Step[];
  endedAt: string | null;
}

interface UserData {
  processes: Process[];
}

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
}

const ProcessCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (!token) {
        setError("Token non disponible. Veuillez vous connecter.");
        return;
      }
      try {
        const response = await axios.get<UserData>(`${backendUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const stepsWithEndDate = response.data.processes.flatMap((process) =>
          process.steps
            .filter((step) => step.endedAt !== null)
            .map((step) => ({
              id: step.id,
              date: new Date(step.endedAt!),
              title: step.name,
            })),
        );

        setEvents(stepsWithEndDate);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const hasEvents = events.some(
      (event) => date.toDateString() === event.date.toDateString(),
    );

    return hasEvents ? (
      <div className="event-dot-container">
        <div className="event-dot" />
      </div>
    ) : null;
  };

  const getDailyEvents = () => {
    if (!selectedDate) return [];
    return events
      .filter(
        (event) => event.date.toDateString() === selectedDate.toDateString(),
      )
      .sort((a, b) => a.id - b.id);
  };

  return (
    <div role="region" aria-label="Process Calendar">
      <style>
        {`
        .calendar-wrapper {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            width: 100%;
            margin: 0 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            overflow: hidden;
            background: white;
        }
        h2 {
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 600;
            color: #20498A;
        }
        .react-calendar {
            line-height: 1.125em;
            background: white;
            padding-bottom: 16px;
            padding-left: 16px;
            padding-right: 16px;
        }
        .react-calendar__navigation {
            display: flex;
            height: 30px;
            border-bottom: 1px solid rgb(160, 152, 152);
            margin-top: 8px;
            margin-bottom: 8px;
        }
        .react-calendar__navigation button {
            min-width: 25px;
            background: white;
            font-size: 16px;
            font-weight: 800;
            padding: 0;
            border: none;
            color: #20498A;
            transition: color 0.2s;
        }
        .react-calendar__navigation button:hover {
            color: #4A88C5;
            border-radius: 10px;
        }
        .react-calendar__navigation button:disabled {
            color: #BBDAF2;
        }
        .react-calendar__month-view__weekdays {
            text-align: center;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
            padding: 2px;
            color: #3D6FAD;
            border-radius: 4px 4px 0 0;

        }
        .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
            border: none;
        }
        .react-calendar__tile {
          text-align: center;
          padding: 8px 0;
          border: 1px solid rgb(195, 212, 246);
          color: rgb(0, 0, 0);
          font-size: 1em;
          font-weight: medium;
          height: 40px;
          width: 40px;
          border-radius: 1px;
          background: white;
          transition: all 0.2s ease;
        }
        .react-calendar__tile:hover {
          color: black;
          background: #F0F5FF;
        }
        .react-calendar__tile--now {
          background: white;
          color: black;
          font-weight: bold;
        }
        .react-calendar__tile--active {
          background: #E8F1FF;
          color: black;
          font-weight: bold;
        }
        .react-calendar__tile--active:hover {
          background: #D5E6FF;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color:rgb(2, 28, 198);
        }
        .events-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          border: 1px solid #E8F1FF;
          height: 150px;
          width: 100%;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        }
        .event-dot-container {
          display: flex;
          justify-content: center;
          margin-bottom: 6px;
        }
        .event-dot {
          width: 6px;
          height: 6px;
          background-color:rgb(23, 9, 177);
          border-radius: 50%;
        }
        .events-list {
          overflow-y: auto;
          height: 100%;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          padding: 12px;
          background: white;
        }
        .event-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          font-size: 16px;
          margin: 6px 0;
          border-radius: 6px;
          color:black;
          font-weight: 400;
          box-shadow: 0 4px 8px rgba(0, 0, 0.2, 0.2);
          transition: transform 0.5s ease;
        }
        .event-list-item:hover {
            transform: translateX(2px);
            transition: background 0.5s;
        }
        .event-time {
          color:rgb(111, 16, 190);
          border-left: 2px solid rgb(111, 16, 190);
          padding-left: 8px;
        }
        .event-title {
          width: 75%;
        }
        `}
      </style>
      <Header title={t("calendar")} icon={<FaCalendar />} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="calendar-wrapper">
        <Calendar
          value={selectedDate ?? new Date()}
          tileContent={getTileContent}
          onChange={(value) => setSelectedDate(value as Date)}
          locale="fr-FR"
          prevLabel="<"
          prev2Label="<<"
          nextLabel=">"
          next2Label=">>"
          formatShortWeekday={(_: string | undefined, date: Date) => {
            const days = [
              t("dim"),
              t("lun"),
              t("mar"),
              t("mer"),
              t("jeu"),
              t("ven"),
              t("sam"),
            ];
            return days[date.getDay()];
          }}
          navigationLabel={({ date }) => {
            const month = date.toLocaleString("fr-FR", { month: "long" });
            const year = date.getFullYear();
            return `${month} ${year}`;
          }}
        />
      </div>

      {selectedDate && (
        <div className="events-container">
          <Header
            title={`${t("eventsOf")} ${selectedDate.toLocaleDateString("fr-FR")}`}
          />
          <div
            className="events-list"
            tabIndex={0}
            aria-label={"Liste des événements"} // t("eventListAriaLabel") ||
          >
            {getDailyEvents().length === 0 ? (
              <p style={{ color: "black" }}>{t("noEvent")}</p>
            ) : (
              getDailyEvents().map((event) => (
                <div key={event.id} className="event-list-item">
                  <span className="event-title">{event.title}</span>
                  <span className="event-time">
                    {event.date.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessCalendar;
