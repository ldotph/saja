import type { StaticImageData } from "next/image";

export type PriorityClass = 1 | 2 | 3;

export type EventAction = {
  label: "Купить билет" | "Встреча VK";
  href: string;
  variant: "primary" | "secondary";
};

export type EventRecord = {
  id: string;
  title?: string;
  artists: string;
  date: string;
  dateLabel: string;
  city: string;
  venue: string;
  mapUrl?: string;
  poster: StaticImageData | string;
  priorityClass: PriorityClass;
  actions: EventAction[];
};

export type CmsEventStatus = "draft" | "published" | "hidden" | "archived";
export type CmsReleaseStatus = "draft" | "published" | "hidden" | "archived";

export type CmsEvent = {
  id: string;
  title?: string;
  artists: string;
  date: string;
  dateLabel: string;
  city: string;
  venue: string;
  mapUrl?: string;
  ticketUrl: string;
  meetingUrl?: string;
  posterUrl: string;
  priorityClass: PriorityClass;
  status: CmsEventStatus;
  sourceSubmissionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionStatus =
  | "new"
  | "draft_created"
  | "published"
  | "rejected";

export type Submission = {
  id: string;
  city: string;
  date: string;
  title?: string;
  artists: string;
  venue: string;
  ticketUrl: string;
  meetingUrl?: string;
  telegramId: string;
  posterUrl: string;
  status: SubmissionStatus;
  eventDraftId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CmsStore = {
  events: CmsEvent[];
  submissions: Submission[];
  releases: CmsRelease[];
  releaseVotes: ReleaseVote[];
};

export type SubmissionInput = {
  city: string;
  date: string;
  title?: string;
  artists: string;
  venue: string;
  ticketUrl: string;
  meetingUrl?: string;
  telegramId: string;
};

export type EventInput = {
  city: string;
  date: string;
  title?: string;
  artists: string;
  venue: string;
  mapUrl?: string;
  ticketUrl: string;
  meetingUrl?: string;
  priorityClass: PriorityClass;
  status: CmsEventStatus;
};

export type CmsRelease = {
  id: string;
  artist: string;
  title: string;
  description: string;
  coverUrl: string;
  status: CmsReleaseStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReleaseVote = {
  id: string;
  releaseId: string;
  score: number;
  voterHash: string;
  createdAt: string;
  updatedAt: string;
};

export type ReleaseInput = {
  artist: string;
  title: string;
  description: string;
  status: CmsReleaseStatus;
};

export type ReleaseRecord = CmsRelease & {
  averageScore: number;
  votesCount: number;
};

export type ReleaseRating = {
  averageScore: number;
  votesCount: number;
};
