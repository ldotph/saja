"use client";

import { useMemo, useState } from "react";
import type { EventRecord } from "@/lib/cms/types";
import { EventCard } from "@/components/event-card";

type EventFiltersProps = {
  cities: readonly string[];
  events: EventRecord[];
};

export function EventFilters({ cities, events }: EventFiltersProps) {
  const [activeCity, setActiveCity] = useState("Все");

  const filteredEvents = useMemo(() => {
    if (activeCity === "Все") {
      return events;
    }

    return events.filter((event) => event.city === activeCity);
  }, [activeCity, events]);

  return (
    <div className="filters">
      <div className="filters__list" aria-label="Фильтр по городам">
        {["Все", ...cities].map((city) => {
          const isActive = city === activeCity;

          return (
            <button
              key={city}
              type="button"
              className="filters__button"
              aria-pressed={isActive}
              onClick={() => setActiveCity(city)}
            >
              {city}
            </button>
          );
        })}
      </div>

      <div className="filters__summary">
        {activeCity === "Все"
          ? `Показаны все афиши: ${filteredEvents.length}`
          : `Показаны афиши по городу «${activeCity}»: ${filteredEvents.length}`}
      </div>

      {filteredEvents.length > 0 ? (
        <div className="cards">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Для выбранного города афиш пока нет. Можете предложить свою афишу с
          помощью специальной формы на сайте.
        </div>
      )}
    </div>
  );
}
