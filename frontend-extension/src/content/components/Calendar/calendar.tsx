import axios from "axios";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTranslation } from "react-i18next";
import getToken from "../../utils/utils";

const backendUrl = "https://www.docroadmap.fr";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
        const response = await axios.get<UserData>(`${backendUrl}users/me`, {
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
    <>
      <style>
        {`
        .calendar-wrapper {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 320px;
            margin: 0 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border-radius: 8px;
            overflow: hidden;
            background: white;
        }
        .calendar-header {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-bottom: 0.25rem;
          flex-direction: row;
          border-bottom: 1px solid #e0e0e0;
        }
        .calendar-title {
          font-size: 1.1rem;
          font-weight: bold;
          padding: 0.5rem 0;
          color: black;
          flex-direction: row;
          margin: 0;
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
            height: 40px;
            margin-bottom: 8px;
        }
        .react-calendar__navigation button {
            min-width: 25px;
            background: none;
            font-size: 16px;
            font-weight: 500;
            padding: 0;
            border: none;
            color: #20498A;
            transition: color 0.2s;
        }
        .react-calendar__navigation button:hover {
            color: #4A88C5;
            background: none;
        }
        .react-calendar__navigation button:disabled {
            color: #BBDAF2;
        }
        .react-calendar__month-view__weekdays {
            text-align: center;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
            
            margin-bottom: 8px;
            color: #3D6FAD;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
            border: none;
        }
        .react-calendar__tile {
            max-width: 100%;
            text-align: center;
            padding: 8px 0;
            border: 1px solid #F0F5FF;
            font-size: 0.9em;
            height: 34px;
            background: white;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .react-calendar__tile:hover {
            background: #F0F5FF;
        }
        .react-calendar__tile--now {
            background: white;
            color: #4A88C5;
            font-weight: bold;
            border: 1px solid #4A88C5;
        }
        .react-calendar__tile--now:hover {
            background: #F0F5FF;
        }
        .react-calendar__tile--active {
            background: #E8F1FF;
            color: #20498A;
            font-weight: bold;
        }
        .react-calendar__tile--active:hover {
        background: #D5E6FF;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
        color: #BBDAF2;
        }
        .event-item {
            font-size: 0.7em;
            background: #E8F1FF;
            margin-top: 2px;
            padding: 2px 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-radius: 2px;
            color: #20498A;
        }
        .event-dot-container {
            display: flex;
            justify-content: center;
            margin: 2px;
        }
        .event-dot {
            width: 6px;
            height: 6px;
            background-color: #4A88C5;
            border-radius: 50%;
        }
        .events-list {
            margin-top: 10px;
            height: 100px;
            overflow-y: auto;
            border: 1px solid #E8F1FF;
            border-radius: 8px;
            padding: 12px;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .events-list h3 {
            color: #20498A;
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .event-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin: 6px 0;
          border-radius: 6px;
          color: #20498A;
          font-size: 0.9em;
          border-left: 3px solid #4A88C5;
          transition: transform 0.2s ease;
        }
        .event-list-item:hover {
            transform: translateX(2px);
            background: #E8F1FF;
        }`}
      </style>
      <div className="calendar-header">
        <h1 className="calendar-title">{t("calendar")}</h1>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="calendar-wrapper">
        <Calendar
          value={selectedDate ?? new Date()}
          tileContent={getTileContent}
          onChange={(value) => setSelectedDate(value as Date)}
          locale="fr-FR"
          prevLabel="<"
          prev2Label="«"
          nextLabel=">"
          next2Label="»"
          formatShortWeekday={(_locale, date) => {
            const days = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
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
        <div className="events-list">
          <h3>
            {t("eventsOf")}
            {selectedDate.toLocaleDateString("fr-FR")}
          </h3>
          {getDailyEvents().length === 0 ? (
            <p>{t("noEvent")}</p>
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
      )}
    </>
  );
};

export default ProcessCalendar;
