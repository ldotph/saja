import { listPublishedEventRecords } from "@/lib/cms/storage";
import { CITY_OPTIONS } from "@/lib/cms/constants";
import type { EventRecord } from "@/lib/cms/types";

export const cityFilterOptions = CITY_OPTIONS;

export const eventsConfig: EventRecord[] = [];

function sortEvents(events: EventRecord[]) {
  return [...events].sort((left, right) => {
    const dateDiff =
      new Date(left.date).getTime() - new Date(right.date).getTime();

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return left.priorityClass - right.priorityClass;
  });
}

export async function getSortedEvents() {
  const cmsEvents = await listPublishedEventRecords();

  return sortEvents([...eventsConfig, ...cmsEvents]);
}

export function getCityOptions(events: EventRecord[]) {
  const eventCities = events.map((event) => event.city);
  return [...new Set([...CITY_OPTIONS, ...eventCities])];
}
