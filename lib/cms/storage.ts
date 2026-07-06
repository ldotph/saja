import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  CmsEvent,
  CmsRelease,
  CmsStore,
  EventInput,
  EventRecord,
  PriorityClass,
  ReleaseInput,
  ReleaseRating,
  ReleaseRecord,
  ReleaseVote,
  Submission,
  SubmissionInput,
  SubmissionStatus
} from "@/lib/cms/types";

const ACCEPTED_FILE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUBMISSION_RETENTION_DAYS = Number(
  process.env.SUBMISSION_RETENTION_DAYS ?? 40
);

const storageDir = process.env.SAJA_STORAGE_DIR
  ? path.resolve(process.env.SAJA_STORAGE_DIR)
  : path.join(process.cwd(), "storage");

const storeFile = path.join(storageDir, "cms.json");

const uploadDir = process.env.SAJA_UPLOAD_DIR
  ? path.resolve(process.env.SAJA_UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

const emptyStore: CmsStore = {
  events: [],
  submissions: [],
  releases: [],
  releaseVotes: []
};

async function ensureStorage() {
  await fs.mkdir(storageDir, { recursive: true });
  await fs.mkdir(uploadDir, { recursive: true });

  try {
    await fs.access(storeFile);
  } catch {
    await writeStore(emptyStore);
  }
}

async function readStore(): Promise<CmsStore> {
  await ensureStorage();
  const rawStore = await fs.readFile(storeFile, "utf8");
  const parsedStore = JSON.parse(rawStore) as Partial<CmsStore>;

  return {
    events: (parsedStore.events ?? []).map(normalizeEvent),
    submissions: (parsedStore.submissions ?? []).map(normalizeSubmission),
    releases: (parsedStore.releases ?? []).map(normalizeRelease),
    releaseVotes: (parsedStore.releaseVotes ?? []).map(normalizeReleaseVote)
  };
}

async function writeStore(store: CmsStore) {
  await fs.mkdir(storageDir, { recursive: true });
  await fs.writeFile(storeFile, JSON.stringify(store, null, 2), "utf8");
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(new Date(`${date}T12:00:00+03:00`));
}

function normalizeOptionalUrl(url: string | undefined) {
  const trimmedUrl = url?.trim();

  return trimmedUrl ? trimmedUrl : undefined;
}

function normalizeOptionalText(text: string | undefined) {
  const trimmedText = text?.trim();

  return trimmedText ? trimmedText : undefined;
}

function normalizeUploadUrl(url: string) {
  if (url.startsWith("/api/uploads/")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `/api${url}`;
  }

  return url;
}

function normalizeEvent(event: CmsEvent) {
  const legacyTitle = event.title?.trim();

  return {
    ...event,
    title: normalizeOptionalText(event.title),
    artists: event.artists?.trim() || legacyTitle || "Без названия",
    posterUrl: normalizeUploadUrl(event.posterUrl),
    mapUrl: normalizeOptionalUrl(event.mapUrl)
  };
}

function normalizeSubmission(submission: Submission) {
  const legacyTitle = submission.title?.trim();

  return {
    ...submission,
    title: normalizeOptionalText(submission.title),
    artists: submission.artists?.trim() || legacyTitle || "Без названия",
    posterUrl: normalizeUploadUrl(submission.posterUrl)
  };
}

function normalizeRelease(release: CmsRelease) {
  return {
    ...release,
    artist: release.artist?.trim() || "Неизвестный артист",
    title: release.title?.trim() || "Без названия",
    description: release.description?.trim() || "Описание появится позже.",
    coverUrl: normalizeUploadUrl(release.coverUrl)
  };
}

function normalizeReleaseVote(vote: ReleaseVote) {
  return {
    ...vote,
    score: Math.min(10, Math.max(1, Number(vote.score) || 1))
  };
}

function buildEventActions(event: CmsEvent): EventRecord["actions"] {
  const actions: EventRecord["actions"] = [
    {
      label: "Купить билет",
      href: event.ticketUrl,
      variant: "primary"
    }
  ];

  if (event.meetingUrl) {
    actions.push({
      label: "Встреча VK",
      href: event.meetingUrl,
      variant: "secondary"
    });
  }

  return actions;
}

function eventToRecord(event: CmsEvent): EventRecord {
  return {
    id: event.id,
    title: event.title,
    artists: event.artists,
    date: event.date,
    dateLabel: event.dateLabel,
    city: event.city,
    venue: event.venue,
    mapUrl: event.mapUrl,
    poster: event.posterUrl,
    priorityClass: event.priorityClass,
    actions: buildEventActions(event)
  };
}

function calculateReleaseRating(
  releaseId: string,
  votes: ReleaseVote[]
): ReleaseRating {
  const releaseVotes = votes.filter((vote) => vote.releaseId === releaseId);
  const votesCount = releaseVotes.length;

  if (votesCount === 0) {
    return {
      averageScore: 0,
      votesCount
    };
  }

  const totalScore = releaseVotes.reduce((sum, vote) => sum + vote.score, 0);

  return {
    averageScore: Number((totalScore / votesCount).toFixed(1)),
    votesCount
  };
}

function releaseToRecord(
  release: CmsRelease,
  votes: ReleaseVote[]
): ReleaseRecord {
  return {
    ...release,
    ...calculateReleaseRating(release.id, votes)
  };
}

function sortReleaseRecords(left: ReleaseRecord, right: ReleaseRecord) {
  if (right.averageScore !== left.averageScore) {
    return right.averageScore - left.averageScore;
  }

  if (right.votesCount !== left.votesCount) {
    return right.votesCount - left.votesCount;
  }

  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function isExpiredSubmission(submission: Submission) {
  const createdAt = new Date(submission.createdAt).getTime();
  const expiresAt =
    createdAt + SUBMISSION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return Date.now() > expiresAt;
}

function isPastEvent(event: CmsEvent) {
  const eventEnd = new Date(`${event.date}T23:59:59+03:00`).getTime();

  return Date.now() > eventEnd;
}

async function pruneExpiredSubmissions(store: CmsStore) {
  const activeSubmissions = store.submissions.filter(
    (submission) => !isExpiredSubmission(submission)
  );

  if (activeSubmissions.length === store.submissions.length) {
    return store;
  }

  const nextStore = {
    ...store,
    submissions: activeSubmissions
  };

  await writeStore(nextStore);
  return nextStore;
}

export function validateImageFile(file: File | null | undefined) {
  if (!(file instanceof File) || file.size === 0) {
    return "Прикрепите изображение афиши.";
  }

  if (!ACCEPTED_FILE_TYPES.has(file.type)) {
    return "Допустимы файлы JPG, PNG или WEBP.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Размер файла не должен превышать 10 МБ.";
  }

  return null;
}

export function validateUrl(value: string, fieldName: string) {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return `${fieldName}: используйте ссылку с http:// или https://.`;
    }

    return null;
  } catch {
    return `${fieldName}: укажите корректную ссылку.`;
  }
}

async function saveUpload(file: File, prefix: string) {
  const fileTypeError = validateImageFile(file);

  if (fileTypeError) {
    throw new Error(fileTypeError);
  }

  const extension = ACCEPTED_FILE_TYPES.get(file.type) ?? "jpg";
  const fileName = `${prefix}-${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  return `/api/uploads/${fileName}`;
}

export function getUploadFilePath(fileName: string) {
  return path.join(uploadDir, path.basename(fileName));
}

export async function listSubmissions() {
  const store = await pruneExpiredSubmissions(await readStore());

  return [...store.submissions].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export async function listEvents() {
  const store = await readStore();

  return [...store.events].sort((left, right) => {
    const dateDiff =
      new Date(left.date).getTime() - new Date(right.date).getTime();

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return left.priorityClass - right.priorityClass;
  });
}

export async function listPublishedEventRecords() {
  const events = await listEvents();

  return events
    .filter((event) => event.status === "published" && !isPastEvent(event))
    .map(eventToRecord);
}

export async function listReleases() {
  const store = await readStore();

  return [...store.releases]
    .map((release) => releaseToRecord(release, store.releaseVotes))
    .sort(sortReleaseRecords);
}

export async function listPublishedReleaseRecords() {
  const releases = await listReleases();

  return releases
    .filter((release) => release.status === "published")
    .slice(0, 10);
}

export function parseReleaseScore(value: unknown) {
  const score = Number(value);

  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw new Error("Оценка должна быть от 1 до 10.");
  }

  return score;
}

export async function addSubmission(input: SubmissionInput, poster: File) {
  const store = await pruneExpiredSubmissions(await readStore());
  const now = new Date().toISOString();
  const posterUrl = await saveUpload(poster, "submission");
  const submission: Submission = {
    id: randomUUID(),
    ...input,
    title: normalizeOptionalText(input.title),
    artists: input.artists,
    meetingUrl: normalizeOptionalUrl(input.meetingUrl),
    posterUrl,
    status: "new",
    createdAt: now,
    updatedAt: now
  };

  store.submissions.unshift(submission);
  await writeStore(store);

  return submission;
}

export async function createEvent(input: EventInput, poster: File) {
  const store = await readStore();
  const now = new Date().toISOString();
  const posterUrl = await saveUpload(poster, "event");
  const event: CmsEvent = {
    id: randomUUID(),
    ...input,
    title: normalizeOptionalText(input.title),
    artists: input.artists,
    mapUrl: normalizeOptionalUrl(input.mapUrl),
    meetingUrl: normalizeOptionalUrl(input.meetingUrl),
    dateLabel: formatDateLabel(input.date),
    posterUrl,
    createdAt: now,
    updatedAt: now
  };

  store.events.unshift(event);
  await writeStore(store);

  return event;
}

export async function createRelease(input: ReleaseInput, cover: File) {
  const store = await readStore();
  const now = new Date().toISOString();
  const coverUrl = await saveUpload(cover, "release");
  const release: CmsRelease = {
    id: randomUUID(),
    ...input,
    artist: input.artist.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    coverUrl,
    createdAt: now,
    updatedAt: now
  };

  store.releases.unshift(release);
  await writeStore(store);

  return release;
}

export async function updateRelease(
  releaseId: string,
  input: ReleaseInput,
  cover?: File
) {
  const store = await readStore();
  const release = store.releases.find((item) => item.id === releaseId);

  if (!release) {
    throw new Error("Релиз не найден.");
  }

  release.artist = input.artist.trim();
  release.title = input.title.trim();
  release.description = input.description.trim();
  release.status = input.status;
  release.updatedAt = new Date().toISOString();

  if (cover && cover.size > 0) {
    release.coverUrl = await saveUpload(cover, "release");
  }

  await writeStore(store);

  return release;
}

export async function setReleaseStatus(
  releaseId: string,
  status: CmsRelease["status"]
) {
  const store = await readStore();
  const release = store.releases.find((item) => item.id === releaseId);

  if (!release) {
    throw new Error("Релиз не найден.");
  }

  release.status = status;
  release.updatedAt = new Date().toISOString();
  await writeStore(store);
}

export async function voteForRelease(
  releaseId: string,
  score: number,
  voterHash: string
) {
  const store = await readStore();
  const release = store.releases.find(
    (item) => item.id === releaseId && item.status === "published"
  );

  if (!release) {
    throw new Error("Релиз не найден или еще не опубликован.");
  }

  const safeScore = parseReleaseScore(score);
  const now = new Date().toISOString();
  const existingVote = store.releaseVotes.find(
    (vote) => vote.releaseId === releaseId && vote.voterHash === voterHash
  );

  if (existingVote) {
    existingVote.score = safeScore;
    existingVote.updatedAt = now;
  } else {
    store.releaseVotes.push({
      id: randomUUID(),
      releaseId,
      score: safeScore,
      voterHash,
      createdAt: now,
      updatedAt: now
    });
  }

  await writeStore(store);

  return calculateReleaseRating(releaseId, store.releaseVotes);
}

export async function updateEvent(
  eventId: string,
  input: EventInput,
  poster?: File
) {
  const store = await readStore();
  const event = store.events.find((item) => item.id === eventId);

  if (!event) {
    throw new Error("Афиша не найдена.");
  }

  event.city = input.city;
  event.date = input.date;
  event.dateLabel = formatDateLabel(input.date);
  event.title = normalizeOptionalText(input.title);
  event.artists = input.artists;
  event.venue = input.venue;
  event.mapUrl = normalizeOptionalUrl(input.mapUrl);
  event.ticketUrl = input.ticketUrl;
  event.meetingUrl = normalizeOptionalUrl(input.meetingUrl);
  event.priorityClass = input.priorityClass;
  event.status = input.status;
  event.updatedAt = new Date().toISOString();

  if (poster && poster.size > 0) {
    event.posterUrl = await saveUpload(poster, "event");
  }

  await writeStore(store);

  return event;
}

export async function createDraftFromSubmission(submissionId: string) {
  const store = await pruneExpiredSubmissions(await readStore());
  const submission = store.submissions.find((item) => item.id === submissionId);

  if (!submission) {
    throw new Error("Заявка не найдена.");
  }

  if (submission.eventDraftId) {
    return submission.eventDraftId;
  }

  const now = new Date().toISOString();
  const draft: CmsEvent = {
    id: randomUUID(),
    title: submission.title,
    artists: submission.artists,
    date: submission.date,
    dateLabel: formatDateLabel(submission.date),
    city: submission.city,
    venue: submission.venue,
    mapUrl: undefined,
    ticketUrl: submission.ticketUrl,
    meetingUrl: submission.meetingUrl,
    posterUrl: submission.posterUrl,
    priorityClass: 2,
    status: "draft",
    sourceSubmissionId: submission.id,
    createdAt: now,
    updatedAt: now
  };

  submission.status = "draft_created";
  submission.eventDraftId = draft.id;
  submission.updatedAt = now;
  store.events.unshift(draft);
  await writeStore(store);

  return draft.id;
}

export async function setEventStatus(
  eventId: string,
  status: CmsEvent["status"]
) {
  const store = await readStore();
  const event = store.events.find((item) => item.id === eventId);

  if (!event) {
    throw new Error("Афиша не найдена.");
  }

  const now = new Date().toISOString();
  event.status = status;
  event.updatedAt = now;

  if (event.sourceSubmissionId && status === "published") {
    const submission = store.submissions.find(
      (item) => item.id === event.sourceSubmissionId
    );

    if (submission) {
      submission.status = "published";
      submission.updatedAt = now;
    }
  }

  await writeStore(store);
}

export async function deleteEvent(eventId: string) {
  const store = await readStore();
  const event = store.events.find((item) => item.id === eventId);

  if (!event) {
    throw new Error("Афиша не найдена.");
  }

  const now = new Date().toISOString();
  event.status = "archived";
  event.updatedAt = now;

  if (event.sourceSubmissionId) {
    const submission = store.submissions.find(
      (item) => item.id === event.sourceSubmissionId
    );

    if (submission) {
      submission.status = "published";
      submission.updatedAt = now;
    }
  }

  await writeStore(store);
}

export async function setSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
) {
  const store = await pruneExpiredSubmissions(await readStore());
  const submission = store.submissions.find((item) => item.id === submissionId);

  if (!submission) {
    throw new Error("Заявка не найдена.");
  }

  submission.status = status;
  submission.updatedAt = new Date().toISOString();
  await writeStore(store);
}

export function parsePriorityClass(value: FormDataEntryValue | null) {
  const parsedValue = Number(value);

  return ([1, 2, 3].includes(parsedValue) ? parsedValue : 2) as PriorityClass;
}
