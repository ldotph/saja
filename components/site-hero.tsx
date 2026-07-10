import Image from "next/image";
import logo from "../assets/logos/logofulln.png";

type SiteHeroProps = {
  activeSection: "posters" | "releases";
};

export function SiteHero({ activeSection }: SiteHeroProps) {
  const heroCopy =
    activeSection === "releases"
      ? {
          eyebrow: "Релизы месяца",
          title: "Рейтинг альбомов и синглов, вышедших в этом месяце.",
          lead: "Оценивайте новые записи от 1 до 5 и помогайте собрать честный рейтинг локальной сцены."
        }
      : {
          eyebrow: "Ближайшие события",
          title: "Актуальные афиши локальных концертов",
          lead: "Самые интересные события андеграунд-сцены, быстрый отбор по городам, прямые ссылки на билеты, встречу и маршрут до клуба, а для музыкантов есть хорошая возможность попромить свой гиг."
        };

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

        <p className="eyebrow">{heroCopy.eyebrow}</p>
        <h1>{heroCopy.title}</h1>
        <p className="hero__lead">{heroCopy.lead}</p>
      </div>
    </section>
  );
}
