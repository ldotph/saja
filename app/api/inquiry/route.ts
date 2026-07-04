import { NextResponse } from "next/server";

const ACCEPTED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent");
  const poster = formData.get("poster");

  if (!name || !contact || !message || !consent) {
    return NextResponse.json(
      { message: "Заполните обязательные поля формы." },
      { status: 400 }
    );
  }

  if (!(poster instanceof File) || poster.size === 0) {
    return NextResponse.json(
      { message: "Прикрепите изображение афиши." },
      { status: 400 }
    );
  }

  if (!ACCEPTED_FILE_TYPES.has(poster.type) || poster.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "Используйте JPG, PNG или WEBP размером до 10 МБ." },
      { status: 400 }
    );
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const messageThreadId = process.env.TELEGRAM_MESSAGE_THREAD_ID;

  if (!botToken || !chatId) {
    return NextResponse.json(
      {
        message:
          "Форма готова, но Telegram-бот ещё не подключён. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env.local и перезапустите приложение."
      },
      { status: 503 }
    );
  }

  try {
    const textPayload = new URLSearchParams({
      chat_id: chatId,
      text: [
        "Новая заявка с сайта концертного агентства.",
        "",
        `Имя / проект: ${name}`,
        `Контакт: ${contact}`,
        "",
        "Сообщение:",
        message
      ].join("\n")
    });

    if (messageThreadId) {
      textPayload.set("message_thread_id", messageThreadId);
    }

    const textResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: textPayload.toString()
      }
    );

    if (!textResponse.ok) {
      return NextResponse.json(
        { message: "Telegram не принял текст заявки. Проверьте токен и chat id." },
        { status: 502 }
      );
    }

    const telegramForm = new FormData();
    telegramForm.set("chat_id", chatId);
    telegramForm.set("caption", "Афиша к новой заявке");
    telegramForm.set("document", poster, poster.name || "poster");

    if (messageThreadId) {
      telegramForm.set("message_thread_id", messageThreadId);
    }

    const fileResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: "POST",
        body: telegramForm
      }
    );

    if (!fileResponse.ok) {
      return NextResponse.json(
        { message: "Telegram не принял файл афиши. Проверьте настройки бота." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: "Заявка отправлена в Telegram. Мы свяжемся с вами по указанному контакту."
    });
  } catch {
    return NextResponse.json(
      { message: "Не удалось отправить заявку в Telegram. Попробуйте позже." },
      { status: 500 }
    );
  }
}
