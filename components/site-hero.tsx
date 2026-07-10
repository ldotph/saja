import Image from "next/image";
import logo from "../assets/logos/logofulln.png";

type SiteHeroProps = {
  activeSection: "posters" | "releases";
};

export function SiteHero({ activeSection }: SiteHeroProps) {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden="true" />
      <header className="hero__header">
        <a className="brand brand--hero" href="/" aria-label="На главную">
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
        <nav className="section-tabs" aria-label="Основные разделы сайта">
          <a
            className={
              activeSection === "posters"
                ? "section-tab section-tab--active"
                : "section-tab"
            }
            href="/#concerts"
          >
            Актуальные афиши
          </a>
          <a
            className={
              activeSection === "releases"
                ? "section-tab section-tab--active"
                : "section-tab"
            }
            href="/releases#releases"
          >
            Релизы месяца
          </a>
        </nav>

        <p className="eyebrow">Ближайшие события</p>
        <h1>Актуальные афиши локальных концертов</h1>
        <p className="hero__lead">
          Самые интересные события андеграунд-сцены, быстрый отбор по городам,
          прямые ссылки на билеты, встречу и маршрут до клуба, а для музыкантов
          есть хорошая возможность попромить свой гиг.
        </p>
      </div>
    </section>
  );
}
