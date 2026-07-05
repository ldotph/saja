import type { StaticImageData } from "next/image";

type EventAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export type EventCardProps = {
  title?: string;
  artists: string;
  dateLabel: string;
  city: string;
  venue: string;
  mapUrl?: string;
  poster: StaticImageData | string;
  priorityClass: 1 | 2 | 3;
  actions: EventAction[];
};

export function EventCard({
  title,
  artists,
  dateLabel,
  city,
  venue,
  mapUrl,
  poster,
  actions
}: EventCardProps) {
  const displayTitle = title || artists;
  const posterSrc = typeof poster === "string" ? poster : poster.src;

  return (
    <article className="card">
      <div className="card__poster">
        <img
          src={posterSrc}
          alt={`Афиша: ${displayTitle}`}
          loading="lazy"
        />
      </div>
      <div className="card__body">
        <h3 className="card__title">{displayTitle}</h3>
        {title ? <div className="card__artists">{artists}</div> : null}
        <div className="card__date">{dateLabel}</div>
        <div className="card__venue">
          {city},{" "}
          {mapUrl ? (
            <a href={mapUrl} target="_blank" rel="noreferrer noopener">
              {venue}
            </a>
          ) : (
            <span>{venue}</span>
          )}
        </div>
        <div className="card__actions">
          {actions.length > 0 ? (
            actions.map((action) => (
              <a
                key={`${displayTitle}-${action.label}`}
                className={`card__action card__action--${action.variant}`}
                href={action.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {action.label}
              </a>
            ))
          ) : (
            <div className="card__note">
              Ссылки на билет и встречу добавляются в конфигурации афиши.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
