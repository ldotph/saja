import Image, { StaticImageData } from "next/image";

type EventAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export type EventCardProps = {
  title: string;
  dateLabel: string;
  city: string;
  venue: string;
  mapUrl: string;
  poster: StaticImageData;
  priorityClass: 1 | 2 | 3;
  actions: EventAction[];
};

export function EventCard({
  title,
  dateLabel,
  city,
  venue,
  mapUrl,
  poster,
  actions
}: EventCardProps) {
  return (
    <article className="card">
      <div className="card__poster">
        <Image
          src={poster}
          alt={`Афиша: ${title}`}
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
        />
      </div>
      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        <div className="card__date">{dateLabel}</div>
        <div className="card__venue">
          {city},{" "}
          <a href={mapUrl} target="_blank" rel="noreferrer noopener">
            {venue}
          </a>
        </div>
        <div className="card__actions">
          {actions.length > 0 ? (
            actions.map((action) => (
              <a
                key={`${title}-${action.label}`}
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
