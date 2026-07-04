"use client";

import { FormEvent, useState } from "react";

type FormErrors = {
  name?: string;
  contact?: string;
  message?: string;
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
      "Форма готова к работе. Отправка заработает сразу после подключения Telegram-бота."
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: FormErrors = {};
    const name = String(formData.get("name") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const consent = formData.get("consent");
    const file = formData.get("poster");

    if (!name) {
      nextErrors.name = "Укажите имя или название проекта.";
    }

    if (!contact) {
      nextErrors.contact = "Укажите email или телефон для связи.";
    }

    if (!message || message.length < 20) {
      nextErrors.message = "Сообщение должно содержать минимум 20 символов.";
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
          <label className="form__label" htmlFor="name">
            Имя или проект
          </label>
          <input
            className="form__input"
            id="name"
            name="name"
            type="text"
            placeholder="Например, группа Север"
          />
          {errors.name ? <div className="form__error">{errors.name}</div> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="contact">
            Email или телефон
          </label>
          <input
            className="form__input"
            id="contact"
            name="contact"
            type="text"
            placeholder="name@mail.ru или +7..."
          />
          {errors.contact ? (
            <div className="form__error">{errors.contact}</div>
          ) : null}
        </div>

        <div className="form__field form__field--full">
          <label className="form__label" htmlFor="message">
            Сообщение
          </label>
          <textarea
            className="form__textarea"
            id="message"
            name="message"
            placeholder="Коротко расскажите о концерте, городе, площадке и приложенной афише."
          />
          {errors.message ? (
            <div className="form__error">{errors.message}</div>
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
