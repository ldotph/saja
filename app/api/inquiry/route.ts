import { NextResponse } from "next/server";
import { addSubmission, validateImageFile, validateUrl } from "@/lib/cms/storage";
import { CITY_OPTIONS } from "@/lib/cms/constants";

export const runtime = "nodejs";

function requiredString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function validateTelegramId(telegramId: string) {
  return /^@?[a-zA-Z0-9_]{5,32}$/.test(telegramId);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const city = requiredString(formData, "city");
  const date = requiredString(formData, "date");
  const title = requiredString(formData, "title");
  const venue = requiredString(formData, "venue");
  const ticketUrl = requiredString(formData, "ticketUrl");
  const meetingUrl = requiredString(formData, "meetingUrl");
  const telegramId = requiredString(formData, "telegramId");
  const consent = formData.get("consent");
  const poster = formData.get("poster");

  if (!city || !date || !title || !venue || !ticketUrl || !telegramId || !consent) {
    return NextResponse.json(
      { message: "Заполните обязательные поля формы." },
      { status: 400 }
    );
  }

  if (!CITY_OPTIONS.includes(city as (typeof CITY_OPTIONS)[number])) {
    return NextResponse.json(
      { message: "Выберите город из списка." },
      { status: 400 }
    );
  }

  if (Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json(
      { message: "Укажите корректную дату события." },
      { status: 400 }
    );
  }

  const ticketUrlError = validateUrl(ticketUrl, "Ссылка на билеты");

  if (ticketUrlError) {
    return NextResponse.json(
      { message: ticketUrlError },
      { status: 400 }
    );
  }

  if (meetingUrl) {
    const meetingUrlError = validateUrl(meetingUrl, "Ссылка на встречу");

    if (meetingUrlError) {
      return NextResponse.json(
        { message: meetingUrlError },
        { status: 400 }
      );
    }
  }

  if (!validateTelegramId(telegramId)) {
    return NextResponse.json(
      { message: "Укажите Telegram ID в формате @username." },
      { status: 400 }
    );
  }

  const fileError = validateImageFile(poster instanceof File ? poster : null);

  if (fileError || !(poster instanceof File)) {
    return NextResponse.json(
      { message: fileError ?? "Прикрепите изображение афиши." },
      { status: 400 }
    );
  }

  await addSubmission(
    {
      city,
      date,
      title,
      venue,
      ticketUrl,
      meetingUrl,
      telegramId
    },
    poster
  );

  return NextResponse.json({
    message: "Заявка отправлена. Мы увидим ее в панели администратора и свяжемся с вами в Telegram."
  });
}
