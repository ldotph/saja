"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminCredentials
} from "@/lib/admin-auth";
import { ADMIN_BASE_PATH } from "@/lib/cms/constants";
import {
  createDraftFromSubmission,
  createEvent,
  deleteEvent,
  parsePriorityClass,
  setEventStatus,
  setSubmissionStatus,
  updateEvent,
  validateImageFile,
  validateUrl
} from "@/lib/cms/storage";
import type { CmsEventStatus } from "@/lib/cms/types";

function getString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function getRequiredString(formData: FormData, field: string, label: string) {
  const value = getString(formData, field);

  if (!value) {
    throw new Error(`Заполните поле: ${label}.`);
  }

  return value;
}

function normalizeOptionalString(value: string) {
  return value ? value : undefined;
}

export async function loginAction(formData: FormData) {
  const login = getString(formData, "login");
  const password = getString(formData, "password");

  if (!verifyAdminCredentials(login, password)) {
    redirect(`${ADMIN_BASE_PATH}?login=failed`);
  }

  await setAdminSession();
  redirect(ADMIN_BASE_PATH);
}

export async function logoutAction() {
  await clearAdminSession();
  redirect(ADMIN_BASE_PATH);
}

export async function createDraftFromSubmissionAction(formData: FormData) {
  await createDraftFromSubmission(getRequiredString(formData, "id", "заявка"));
  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function rejectSubmissionAction(formData: FormData) {
  await setSubmissionStatus(
    getRequiredString(formData, "id", "заявка"),
    "rejected"
  );
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function createEventAction(formData: FormData) {
  const ticketUrl = getRequiredString(formData, "ticketUrl", "ссылка на билеты");
  const mapUrl = getString(formData, "mapUrl");
  const meetingUrl = getString(formData, "meetingUrl");
  const poster = formData.get("poster");
  const fileError = validateImageFile(poster instanceof File ? poster : null);

  if (fileError || !(poster instanceof File)) {
    throw new Error(fileError ?? "Прикрепите изображение афиши.");
  }

  const ticketUrlError = validateUrl(ticketUrl, "Ссылка на билеты");

  if (ticketUrlError) {
    throw new Error(ticketUrlError);
  }

  if (meetingUrl) {
    const meetingUrlError = validateUrl(meetingUrl, "Ссылка на встречу");

    if (meetingUrlError) {
      throw new Error(meetingUrlError);
    }
  }

  if (mapUrl) {
    const mapUrlError = validateUrl(mapUrl, "Ссылка на карту клуба");

    if (mapUrlError) {
      throw new Error(mapUrlError);
    }
  }

  await createEvent(
    {
      city: getRequiredString(formData, "city", "город"),
      date: getRequiredString(formData, "date", "дата"),
      title: getRequiredString(formData, "title", "название события"),
      venue: getRequiredString(formData, "venue", "клуб"),
      mapUrl: normalizeOptionalString(mapUrl),
      ticketUrl,
      meetingUrl: normalizeOptionalString(meetingUrl),
      priorityClass: parsePriorityClass(formData.get("priorityClass")),
      status: (getString(formData, "status") || "draft") as CmsEventStatus
    },
    poster
  );

  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function updateEventAction(formData: FormData) {
  const ticketUrl = getRequiredString(formData, "ticketUrl", "ссылка на билеты");
  const mapUrl = getString(formData, "mapUrl");
  const meetingUrl = getString(formData, "meetingUrl");
  const poster = formData.get("poster");
  const ticketUrlError = validateUrl(ticketUrl, "Ссылка на билеты");

  if (ticketUrlError) {
    throw new Error(ticketUrlError);
  }

  if (meetingUrl) {
    const meetingUrlError = validateUrl(meetingUrl, "Ссылка на встречу");

    if (meetingUrlError) {
      throw new Error(meetingUrlError);
    }
  }

  if (mapUrl) {
    const mapUrlError = validateUrl(mapUrl, "Ссылка на карту клуба");

    if (mapUrlError) {
      throw new Error(mapUrlError);
    }
  }

  if (poster instanceof File && poster.size > 0) {
    const fileError = validateImageFile(poster);

    if (fileError) {
      throw new Error(fileError);
    }
  }

  await updateEvent(
    getRequiredString(formData, "id", "афиша"),
    {
      city: getRequiredString(formData, "city", "город"),
      date: getRequiredString(formData, "date", "дата"),
      title: getRequiredString(formData, "title", "название события"),
      venue: getRequiredString(formData, "venue", "клуб"),
      mapUrl: normalizeOptionalString(mapUrl),
      ticketUrl,
      meetingUrl: normalizeOptionalString(meetingUrl),
      priorityClass: parsePriorityClass(formData.get("priorityClass")),
      status: (getString(formData, "status") || "draft") as CmsEventStatus
    },
    poster instanceof File ? poster : undefined
  );

  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function publishEventAction(formData: FormData) {
  await setEventStatus(
    getRequiredString(formData, "id", "афиша"),
    "published"
  );
  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function hideEventAction(formData: FormData) {
  await setEventStatus(getRequiredString(formData, "id", "афиша"), "hidden");
  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function deleteEventAction(formData: FormData) {
  await deleteEvent(getRequiredString(formData, "id", "афиша"));
  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}

export async function returnEventToDraftAction(formData: FormData) {
  await setEventStatus(getRequiredString(formData, "id", "афиша"), "draft");
  revalidatePath("/");
  revalidatePath(ADMIN_BASE_PATH);
  redirect(ADMIN_BASE_PATH);
}
