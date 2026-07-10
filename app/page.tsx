import { InquiryModal } from "@/components/inquiry-modal";
import { SiteHero } from "@/components/site-hero";
import { getCityOptions, getSortedEvents } from "@/data/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getSortedEvents();
  const cities = getCityOptions(events);

  return (
    <main className="page-shell">
      <SiteHero activeSection="posters" />

      <section className="concerts" id="concerts" aria-labelledby="concerts-title">
        <div className="section-heading">
          <p className="eyebrow">Афиши</p>
          <h2 id="concerts-title">Ближайшие концерты</h2>
        </div>
        <InquiryModal cities={cities} events={events} />
      </section>
    </main>
  );
}
