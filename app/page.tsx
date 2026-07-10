import Image from "next/image";
import logo from "../assets/logos/logofulln.png";
import { InquiryModal } from "@/components/inquiry-modal";
import { getCityOptions, getSortedEvents } from "@/data/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getSortedEvents();
  const cities = getCityOptions(events);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__backdrop" aria-hidden="true" />
        <header className="hero__header">
          <a className="brand brand--hero" href="#concerts" aria-label="Перейти к афишам">
            <div className="brand__mark brand__mark--hero">
              <Image
                src={logo}
                alt="Логотип SAJA"
                priority
                sizes="(max-width: 760px) calc(100vw - 40px), 1240px"
              />
            </div>
          </a>
        </header>

        <div className="hero__content">
          <p className="eyebrow">Ближайшие события</p>
          <h1>Актуальные афиши локальных концертов</h1>
          <p className="hero__lead">
            Самые интересные события андеграунд-сцены, быстрый отбор по городам,
            прямые ссылки на билеты, встречу и маршрут до клуба, а для
            музыкантов есть хорошая возможность попромить свой гиг.
          </p>
          <nav className="section-tabs" aria-label="Основные разделы сайта">
            <a className="section-tab section-tab--active" href="#concerts">
              <span className="section-tab__label">Актуальные афиши</span>
              <span className="section-tab__text">
                Концерты локальной сцены на ближайшие даты.
              </span>
            </a>
            <a className="section-tab" href="/releases">
              <span className="section-tab__label">Релизы месяца</span>
              <span className="section-tab__text">
                Рейтинг альбомов и синглов, вышедших в этом месяце.
              </span>
            </a>
          </nav>
        </div>
      </section>

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
