// EventDetailsPanel.tsx
// import React, { useEffect, useState } from "react";
import {t} from "i18next";

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
}

interface EventDetailsPanelProps {
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  selectedDate: Date | null;
}

const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({
  open,
  onClose,
  events,
  selectedDate,
}) => {
  if (!open || !selectedDate) return null;

  const dailyEvents = events
    .filter(
      (event) => event.date.toDateString() === selectedDate.toDateString()
    )
    .sort((a, b) => a.id - b.id);

  return (
    <div className="events-list">
      <button onClick={onClose} style={{ float: "right" }}>
        {t("close")}
      </button>
      <h3>
        {t("eventsOf")} {selectedDate.toLocaleDateString("fr-FR")}
      </h3>
      {dailyEvents.length === 0 ? (
        <p>{t("noEvent")}</p>
      ) : (
        dailyEvents.map((event) => (
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
  );
};

export default EventDetailsPanel;