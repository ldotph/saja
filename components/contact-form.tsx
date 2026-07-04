"use client";

import { FormEvent, useState } from "react";

type FormErrors = {
  city?: string;
  date?: string;
  title?: string;
  artists?: string;
  venue?: string;
  ticketUrl?: string;
  meetingUrl?: string;
  telegramId?: string;
  file?: string;
  consent?: string;
};

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ContactForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({
    tone: "idle",
    message:
      "Заполните поля, и заявка попадет в очередь на рассмотрение."
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: FormErrors = {};
    const city = String(formData.get("city") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const artists = String(formData.get("artists") ?? "").trim();
    const venue = String(formData.get("venue") ?? "").trim();
    const ticketUrl = String(formData.get("ticketUrl") ?? "").trim();
    const meetingUrl = String(formData.get("meetingUrl") ?? "").trim();
    const telegramId = String(formData.get("telegramId") ?? "").trim();
    const consent = formData.get("consent");
    const file = formData.get("poster");

    if (!city) {
      nextErrors.city = "Выберите город.";
    }

    if (!date) {
      nextErrors.date = "Укажите дату концерта.";
    }

    if (!artists) {
      nextErrors.artists = "Укажите выступающие коллективы.";
    }

    if (!venue) {
      nextErrors.venue = "Укажите клуб или площадку.";
    }

    if (!ticketUrl) {
      nextErrors.ticketUrl = "Укажите ссылку на билеты.";
    }

    if (meetingUrl && !/^https?:\/\//.test(meetingUrl)) {
      nextErrors.meetingUrl = "Ссылка должна начинаться с http:// или https://.";
    }

    if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(telegramId)) {
      nextErrors.telegramId = "Укажите Telegram ID в формате @username.";
    }

    if (!(file instanceof File) || file.size === 0) {
      nextErrors.file = "Прикрепите изображение афиши.";
    } else {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        nextErrors.file = "Допустимы файлы JPG, PNG или WEBP.";
      }

      if (file.size > MAX_FILE_SIZE) {
        nextErrors.file = "Размер файла не должен превышать 10 МБ.";
      }
    }

    if (!consent) {
      nextErrors.consent = "Нужно согласие на обработку персональных данных.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        tone: "error",
        message: "Проверьте форму: часть полей заполнена некорректно."
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({
      tone: "idle",
      message: "Отправляем заявку..."
    });

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Не удалось отправить форму.");
      }

      setStatus({
        tone: "success",
        message: payload.message || "Заявка успешно отправлена."
      });
      setErrors({});
      form.reset();
    } catch (submitError) {
      setStatus({
        tone: "error",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Не удалось отправить форму."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="city">
            Город
          </label>
          <select
            className="form__input"
            id="city"
            name="city"
            defaultValue=""
          >
            <option value="" disabled>
              Выберите город
            </option>
            <option value="Москва">Москва</option>
            <option value="Санкт-Петербург">Санкт-Петербург</option>
            <option value="Воронеж">Воронеж</option>
            <option value="Нижний Новгород">Нижний Новгород</option>
          </select>
          {errors.city ? <div className="form__error">{errors.city}</div> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="date">
            Дата
          </label>
          <input
            className="form__input"
            id="date"
            name="date"
            type="date"
          />
          {errors.date ? <div className="form__error">{errors.date}</div> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="title">
            Название события, если есть
          </label>
          <input
            className="form__input"
            id="title"
            name="title"
            type="text"
            placeholder="Например: Test Fest vol. lV"
          />
          {errors.title ? (
            <div className="form__error">{errors.title}</div>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="artists">
            Выступающие коллективы
          </label>
          <input
            className="form__input"
            id="artists"
            name="artists"
            type="text"
            placeholder="Например: Рок-музыкант, Панк-группа, Шумовой артист"
          />
          {errors.artists ? (
            <div className="form__error">{errors.artists}</div>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="venue">
            Клуб
          </label>
          <input
            className="form__input"
            id="venue"
            name="venue"
            type="text"
            placeholder="Название площадки"
          />
          {errors.venue ? <div className="form__error">{errors.venue}</div> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="ticketUrl">
            Ссылка на билеты
          </label>
          <input
            className="form__input"
            id="ticketUrl"
            name="ticketUrl"
            type="url"
            placeholder="https://..."
          />
          {errors.ticketUrl ? (
            <div className="form__error">{errors.ticketUrl}</div>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="meetingUrl">
            Встреча VK
          </label>
          <input
            className="form__input"
            id="meetingUrl"
            name="meetingUrl"
            type="url"
            placeholder="https://vk.ru/... если есть"
          />
          {errors.meetingUrl ? (
            <div className="form__error">{errors.meetingUrl}</div>
          ) : null}
        </div>

        <div className="form__field form__field--full">
          <label className="form__label" htmlFor="telegramId">
            Telegram ID для обратной связи
          </label>
          <input
            className="form__input"
            id="telegramId"
            name="telegramId"
            type="text"
            placeholder="@username"
          />
          {errors.telegramId ? (
            <div className="form__error">{errors.telegramId}</div>
          ) : null}
        </div>

        <div className="form__field form__field--full">
          <label className="form__label" htmlFor="poster">
            Изображение афиши
          </label>
          <input
            className="form__file"
            id="poster"
            name="poster"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
          />
          <div className="form__hint">
            Поддерживаются JPG, PNG и WEBP до 10 МБ.
          </div>
          {errors.file ? <div className="form__error">{errors.file}</div> : null}
        </div>
      </div>

      <label className="form__policy">
        <input name="consent" type="checkbox" value="accepted" />
        <span>
          Даю согласие на обработку персональных данных для обратной связи по
          заявке.
        </span>
      </label>
      {errors.consent ? <div className="form__error">{errors.consent}</div> : null}

      <button className="form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Отправка..." : "Отправить"}
      </button>

      <div className="form__status" data-tone={status.tone} aria-live="polite">
        {status.message}
      </div>
    </form>
  );
}
