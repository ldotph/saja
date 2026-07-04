import { listPublishedEventRecords } from "@/lib/cms/storage";
import { CITY_OPTIONS } from "@/lib/cms/constants";
import type { EventRecord } from "@/lib/cms/types";
import firstPoster from "../assets/posters/1.jpg";
import secondPoster from "../assets/posters/2.jpg";
import thirdPoster from "../assets/posters/3.jpg";

export const cityFilterOptions = CITY_OPTIONS;

export const eventsConfig: EventRecord[] = [
  {
    id: "aria-moscow-2026-08-11",
    title: 'Группа "Ария"',
    date: "2026-08-11",
    dateLabel: "11 августа",
    city: "Москва",
    venue: "Клуб Eclipse",
    mapUrl: "https://yandex.ru/maps/-/CTe6qZm6",
    poster: firstPoster,
    priorityClass: 1,
    actions: [
      {
        label: "Купить билет",
        href: "http://supruga.ticketscloud.org/",
        variant: "primary"
      },
      {
        label: "Встреча VK",
        href: "https://vk.ru/club238491295",
        variant: "secondary"
      }
    ]
  },
  {
    id: "pechora-spb-2026-08-12",
    title: 'Группа "Печора"',
    date: "2026-08-12",
    dateLabel: "12 августа",
    city: "Санкт-Петербург",
    venue: "Клуб Ласточка",
    mapUrl: "https://yandex.ru/maps/-/CTe6qT2b",
    poster: secondPoster,
    priorityClass: 2,
    actions: [
      {
        label: "Купить билет",
        href: "http://supruga4444.ticketscloud.org/",
        variant: "primary"
      },
      {
        label: "Встреча VK",
        href: "https://vk.ru/club231657761",
        variant: "secondary"
      }
    ]
  },
  {
    id: "green-voronezh-2026-08-13",
    title: 'Группа "ГРИН"',
    date: "2026-08-13",
    dateLabel: "13 августа",
    city: "Воронеж",
    venue: "Клуб Котельная",
    mapUrl: "https://yandex.ru/maps/-/CTe6uEpe",
    poster: thirdPoster,
    priorityClass: 3,
    actions: [
      {
        label: "Купить билет",
        href: "https://moscow.qtickets.events/234401-aferist",
        variant: "primary"
      },
      {
        label: "Встреча VK",
        href: "https://vk.ru/club232753435",
        variant: "secondary"
      }
    ]
  }
];

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
