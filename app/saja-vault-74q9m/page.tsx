import { isAdminAuthenticated } from "@/lib/admin-auth";
import { CITY_OPTIONS } from "@/lib/cms/constants";
import { listEvents, listSubmissions } from "@/lib/cms/storage";
import type { CmsEvent, Submission } from "@/lib/cms/types";
import {
  createDraftFromSubmissionAction,
  createEventAction,
  deleteEventAction,
  hideEventAction,
  loginAction,
  logoutAction,
  publishEventAction,
  rejectSubmissionAction,
  returnEventToDraftAction,
  updateEventAction
} from "./actions";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    login?: string;
  }>;
};

const submissionStatusLabels: Record<Submission["status"], string> = {
  new: "Новая",
  draft_created: "Черновик создан",
  published: "Опубликована",
  rejected: "Отклонена"
};

const eventStatusLabels: Record<CmsEvent["status"], string> = {
  draft: "Черновик",
  published: "Опубликовано",
  hidden: "Скрыто"
};

function formatAdminDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function AdminLogin({ hasError }: { hasError: boolean }) {
  return (
    <main className="admin-login">
      <form className="admin-login__panel" action={loginAction}>
        <p className="eyebrow">SAJA control</p>
        <h1>Вход в панель</h1>
        <label className="admin-field">
          <span>Логин</span>
          <input name="login" type="text" autoComplete="username" required />
        </label>
        <label className="admin-field">
          <span>Пароль</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {hasError ? (
          <div className="admin-alert">Неверный логин или пароль.</div>
        ) : null}
        <button className="admin-button admin-button--primary" type="submit">
          Войти
        </button>
      </form>
    </main>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const displayTitle = submission.title || submission.artists;

  return (
    <article className="admin-card">
      <img
        className="admin-card__poster"
        src={submission.posterUrl}
        alt={`Афиша: ${displayTitle}`}
      />
      <div className="admin-card__content">
        <div className="admin-card__meta">
          <span>{submissionStatusLabels[submission.status]}</span>
          <span>{formatAdminDate(submission.createdAt)}</span>
        </div>
        <h3>{displayTitle}</h3>
        {submission.title ? (
          <div className="admin-artists">{submission.artists}</div>
        ) : null}
        <dl className="admin-details">
          <div>
            <dt>Город</dt>
            <dd>{submission.city}</dd>
          </div>
          <div>
            <dt>Дата</dt>
            <dd>{submission.date}</dd>
          </div>
          <div>
            <dt>Клуб</dt>
            <dd>{submission.venue}</dd>
          </div>
          <div>
            <dt>Telegram</dt>
            <dd>{submission.telegramId}</dd>
          </div>
        </dl>
        <div className="admin-links">
          <a href={submission.ticketUrl} target="_blank" rel="noreferrer">
            Билеты
          </a>
          {submission.meetingUrl ? (
            <a href={submission.meetingUrl} target="_blank" rel="noreferrer">
              Встреча VK
            </a>
          ) : null}
        </div>
        {submission.status === "new" ? (
          <div className="admin-actions">
            <form action={createDraftFromSubmissionAction}>
              <input name="id" type="hidden" value={submission.id} />
              <button
                className="admin-button admin-button--primary"
                type="submit"
              >
                Создать черновик
              </button>
            </form>
            <form action={rejectSubmissionAction}>
              <input name="id" type="hidden" value={submission.id} />
              <button className="admin-button" type="submit">
                Отклонить
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-note">
            {submission.status === "draft_created"
              ? "Черновик уже создан и находится в разделе афиш."
              : "Заявка обработана."}
          </div>
        )}
      </div>
    </article>
  );
}

function EventCard({ event }: { event: CmsEvent }) {
  const displayTitle = event.title || event.artists;

  return (
    <article className="admin-card">
      <img
        className="admin-card__poster"
        src={event.posterUrl}
        alt={`Афиша: ${displayTitle}`}
      />
      <div className="admin-card__content">
        <div className="admin-card__meta">
          <span>{eventStatusLabels[event.status]}</span>
          <span>{event.dateLabel}</span>
        </div>
        <h3>{displayTitle}</h3>
        {event.title ? (
          <div className="admin-artists">{event.artists}</div>
        ) : null}
        <dl className="admin-details">
          <div>
            <dt>Город</dt>
            <dd>{event.city}</dd>
          </div>
          <div>
            <dt>Дата</dt>
            <dd>{event.date}</dd>
          </div>
          <div>
            <dt>Клуб</dt>
            <dd>
              {event.mapUrl ? (
                <a href={event.mapUrl} target="_blank" rel="noreferrer">
                  {event.venue}
                </a>
              ) : (
                event.venue
              )}
            </dd>
          </div>
          <div>
            <dt>Приоритет</dt>
            <dd>{event.priorityClass}</dd>
          </div>
        </dl>
        <div className="admin-links">
          <a href={event.ticketUrl} target="_blank" rel="noreferrer">
            Билеты
          </a>
          {event.meetingUrl ? (
            <a href={event.meetingUrl} target="_blank" rel="noreferrer">
              Встреча VK
            </a>
          ) : null}
          {event.mapUrl ? (
            <a href={event.mapUrl} target="_blank" rel="noreferrer">
              Карта
            </a>
          ) : null}
        </div>
        <div className="admin-actions">
          <form action={publishEventAction}>
            <input name="id" type="hidden" value={event.id} />
            <button
              className="admin-button admin-button--primary"
              type="submit"
              disabled={event.status === "published"}
            >
              Опубликовать
            </button>
          </form>
          <form action={hideEventAction}>
            <input name="id" type="hidden" value={event.id} />
            <button className="admin-button" type="submit">
              Скрыть
            </button>
          </form>
          <form action={deleteEventAction}>
            <input name="id" type="hidden" value={event.id} />
            <button className="admin-button" type="submit">
              Удалить с сайта
            </button>
          </form>
          <form action={returnEventToDraftAction}>
            <input name="id" type="hidden" value={event.id} />
            <button className="admin-button" type="submit">
              В черновик
            </button>
          </form>
        </div>
        <details className="admin-edit">
          <summary>Редактировать афишу</summary>
          <form className="admin-form admin-form--compact" action={updateEventAction}>
            <input name="id" type="hidden" value={event.id} />
            <label className="admin-field">
              <span>Город</span>
              <select name="city" required defaultValue={event.city}>
                {CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Дата</span>
              <input name="date" type="date" required defaultValue={event.date} />
            </label>
            <label className="admin-field">
              <span>Название события, если есть</span>
              <input
                name="title"
                type="text"
                placeholder="Например: Test Fest vol. lV"
                defaultValue={event.title ?? ""}
              />
            </label>
            <label className="admin-field">
              <span>Выступающие коллективы</span>
              <input
                name="artists"
                type="text"
                required
                placeholder="Например: Рок-музыкант, Панк-группа, Шумовой артист"
                defaultValue={event.artists}
              />
            </label>
            <label className="admin-field">
              <span>Клуб</span>
              <input name="venue" type="text" required defaultValue={event.venue} />
            </label>
            <label className="admin-field">
              <span>Ссылка на билеты</span>
              <input
                name="ticketUrl"
                type="url"
                required
                defaultValue={event.ticketUrl}
              />
            </label>
            <label className="admin-field">
              <span>Карта клуба</span>
              <input
                name="mapUrl"
                type="url"
                placeholder="https://yandex.ru/maps/..."
                defaultValue={event.mapUrl ?? ""}
              />
            </label>
            <label className="admin-field">
              <span>Встреча VK</span>
              <input
                name="meetingUrl"
                type="url"
                defaultValue={event.meetingUrl ?? ""}
              />
            </label>
            <label className="admin-field">
              <span>Приоритет</span>
              <select name="priorityClass" defaultValue={event.priorityClass}>
                <option value="1">1 — выше</option>
                <option value="2">2 — обычный</option>
                <option value="3">3 — ниже</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Статус</span>
              <select name="status" defaultValue={event.status}>
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
                <option value="hidden">Скрыто</option>
              </select>
            </label>
            <label className="admin-field admin-field--wide">
              <span>Заменить файл афиши</span>
              <input name="poster" type="file" accept=".jpg,.jpeg,.png,.webp" />
            </label>
            <button className="admin-button admin-button--primary" type="submit">
              Сохранить изменения
            </button>
          </form>
        </details>
      </div>
    </article>
  );
}

function CreateEventForm() {
  return (
    <form className="admin-form" action={createEventAction}>
      <label className="admin-field">
        <span>Город</span>
        <select name="city" required defaultValue="">
          <option value="" disabled>
            Выберите город
          </option>
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field">
        <span>Дата</span>
        <input name="date" type="date" required />
      </label>
      <label className="admin-field">
        <span>Название события, если есть</span>
        <input
          name="title"
          type="text"
          placeholder="Например: Test Fest vol. lV"
        />
      </label>
      <label className="admin-field">
        <span>Выступающие коллективы</span>
        <input
          name="artists"
          type="text"
          required
          placeholder="Например: Рок-музыкант, Панк-группа, Шумовой артист"
        />
      </label>
      <label className="admin-field">
        <span>Клуб</span>
        <input name="venue" type="text" required />
      </label>
      <label className="admin-field">
        <span>Ссылка на билеты</span>
        <input name="ticketUrl" type="url" placeholder="https://..." required />
      </label>
      <label className="admin-field">
        <span>Карта клуба</span>
        <input name="mapUrl" type="url" placeholder="https://yandex.ru/maps/..." />
      </label>
      <label className="admin-field">
        <span>Встреча VK</span>
        <input name="meetingUrl" type="url" placeholder="https://vk.ru/..." />
      </label>
      <label className="admin-field">
        <span>Приоритет</span>
        <select name="priorityClass" defaultValue="2">
          <option value="1">1 — выше</option>
          <option value="2">2 — обычный</option>
          <option value="3">3 — ниже</option>
        </select>
      </label>
      <label className="admin-field">
        <span>Статус</span>
        <select name="status" defaultValue="draft">
          <option value="draft">Черновик</option>
          <option value="published">Опубликовать сразу</option>
          <option value="hidden">Скрыто</option>
        </select>
      </label>
      <label className="admin-field admin-field--wide">
        <span>Файл афиши</span>
        <input name="poster" type="file" accept=".jpg,.jpeg,.png,.webp" required />
      </label>
      <button className="admin-button admin-button--primary" type="submit">
        Создать афишу
      </button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLogin hasError={params?.login === "failed"} />;
  }

  const [submissions, events] = await Promise.all([
    listSubmissions(),
    listEvents()
  ]);

  const newSubmissionsCount = submissions.filter(
    (submission) => submission.status === "new"
  ).length;
  const publishedEventsCount = events.filter(
    (event) => event.status === "published"
  ).length;
  const newSubmissions = submissions.filter(
    (submission) => submission.status === "new"
  );
  const processedSubmissions = submissions.filter(
    (submission) => submission.status !== "new"
  );
  const draftEvents = events.filter((event) => event.status !== "published");
  const publishedEvents = events.filter((event) => event.status === "published");

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">SAJA control</p>
          <h1>Панель администратора</h1>
          <p>Заявки хранятся 60 дней.</p>
        </div>
        <form action={logoutAction}>
          <button className="admin-button" type="submit">
            Выйти
          </button>
        </form>
      </header>

      <section className="admin-stats" aria-label="Статистика">
        <div>
          <span>Новые заявки</span>
          <strong>{newSubmissionsCount}</strong>
        </div>
        <div>
          <span>Всего афиш в панели</span>
          <strong>{events.length}</strong>
        </div>
        <div>
          <span>Опубликовано</span>
          <strong>{publishedEventsCount}</strong>
        </div>
      </section>

      <section className="admin-section" aria-labelledby="submissions-title">
        <div className="admin-section__heading">
          <h2 id="submissions-title">Заявки</h2>
          <span>{newSubmissions.length}</span>
        </div>
        <div className="admin-list">
          {newSubmissions.length > 0 ? (
            newSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))
          ) : (
            <div className="empty-state">Новых заявок пока нет.</div>
          )}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="processed-submissions-title">
        <div className="admin-section__heading">
          <h2 id="processed-submissions-title">Обработанные заявки</h2>
          <span>{processedSubmissions.length}</span>
        </div>
        <div className="admin-list">
          {processedSubmissions.length > 0 ? (
            processedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))
          ) : (
            <div className="empty-state">Обработанных заявок пока нет.</div>
          )}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="create-event-title">
        <div className="admin-section__heading">
          <h2 id="create-event-title">Быстро создать афишу</h2>
        </div>
        <CreateEventForm />
      </section>

      <section className="admin-section" aria-labelledby="draft-events-title">
        <div className="admin-section__heading">
          <h2 id="draft-events-title">Черновики и скрытые афиши</h2>
          <span>{draftEvents.length}</span>
        </div>
        <div className="admin-list">
          {draftEvents.length > 0 ? (
            draftEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="empty-state">Черновиков и скрытых афиш пока нет.</div>
          )}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="published-events-title">
        <div className="admin-section__heading">
          <h2 id="published-events-title">Опубликованные афиши</h2>
          <span>{publishedEvents.length}</span>
        </div>
        <div className="admin-list">
          {publishedEvents.length > 0 ? (
            publishedEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="empty-state">Опубликованных афиш пока нет.</div>
          )}
        </div>
      </section>
    </main>
  );
}
