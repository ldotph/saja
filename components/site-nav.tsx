type SiteNavProps = {
  active: "events" | "releases";
};

export function SiteNav({ active }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label="Основная навигация">
      <a
        className="site-nav__link"
        data-active={active === "events"}
        href="/#concerts"
      >
        <span>Афиши</span>
        <small>Концерты и заявки</small>
      </a>
      <a
        className="site-nav__link"
        data-active={active === "releases"}
        href="/releases"
      >
        <span>Релизы недели</span>
        <small>Альбомы и рейтинг</small>
      </a>
    </nav>
  );
}
