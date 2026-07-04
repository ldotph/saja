import Image from "next/image";
import logo from "../assets/logos/logofulln.png";
import { ContactForm } from "@/components/contact-form";
import { EventFilters } from "@/components/event-filters";
import { cityFilterOptions, getSortedEvents } from "@/data/events";

export default function HomePage() {
  const events = getSortedEvents();
  const cities = cityFilterOptions;

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
          <a className="hero__cta" href="#contact">
            Разместить афишу
          </a>
        </div>
      </section>

      <section className="concerts" id="concerts" aria-labelledby="concerts-title">
        <div className="section-heading">
          <p className="eyebrow">Афиши</p>
          <h2 id="concerts-title">Ближайшие концерты</h2>
        </div>
        <EventFilters cities={cities} events={events} />
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="section-heading">
          <p className="eyebrow">Для музыкантов</p>
          <h2 id="contact-title">Оставить заявку на размещение афиши</h2>
          <p className="section-copy">
            Заполните форму, приложите изображение афиши и оставьте контакт для
            связи. Заявка отправляется напрямую в Telegram после подключения бота.
          </p>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
