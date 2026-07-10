import type { Metadata } from "next";
import { ReleaseVoteForm } from "@/components/release-vote-form";
import { SiteHero } from "@/components/site-hero";
import {
  getBestPreviousMonthRelease,
  listPublishedReleaseRecords
} from "@/lib/cms/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Релизы месяца — САЖА",
  description: "Рейтинг альбомов и синглов, вышедших в этом месяце."
};

export default async function ReleasesPage() {
  const [releases, bestPreviousMonthRelease] = await Promise.all([
    listPublishedReleaseRecords(),
    getBestPreviousMonthRelease()
  ]);

  return (
    <main className="page-shell releases-page">
      <SiteHero activeSection="releases" />

      <section
        className="releases-section"
        id="releases"
        aria-labelledby="releases-title"
      >
        <div className="section-heading">
          <p className="eyebrow">Рейтинг слушателей</p>
          <h2 id="releases-title">Релизы месяца</h2>
          <p className="section-copy">
            Рейтинг альбомов и синглов, вышедших в этом месяце. Оцените релизы
            от 1 до 5: общий рейтинг пересобирается автоматически и учитывает не
            только среднюю оценку, но и количество голосов.
          </p>
        </div>

        {releases.length > 0 ? (
          <div className="release-grid">
            {releases.map((release, index) => (
              <article className="release-card" key={release.id}>
                <div className="release-card__rank">
                  #{String(index + 1).padStart(2, "0")}
                </div>
                <img
                  className="release-card__cover"
                  src={release.coverUrl}
                  alt={`Обложка: ${release.artist} — ${release.title}`}
                />
                <div className="release-card__body">
                  <p className="release-card__artist">{release.artist}</p>
                  <h3>{release.title}</h3>
                  <p className="release-card__description">
                    {release.description}
                  </p>
                  <ReleaseVoteForm
                    releaseId={release.id}
                    initialAverageScore={release.averageScore}
                    initialVotesCount={release.votesCount}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Релизы месяца пока не опубликованы. Добавьте их в панели
            администратора.
          </div>
        )}
      </section>

      <section
        className="releases-section"
        aria-labelledby="previous-month-title"
      >
        <div className="section-heading">
          <p className="eyebrow">Итоги</p>
          <h2 id="previous-month-title">Лучший альбом прошлого месяца</h2>
          <p className="section-copy">
            Победитель выбирается по взвешенному рейтингу: учитывается не
            только средняя оценка, но и количество голосов.
          </p>
        </div>

        {bestPreviousMonthRelease ? (
          <article className="release-winner">
            <img
              className="release-winner__cover"
              src={bestPreviousMonthRelease.coverUrl}
              alt={`Обложка: ${bestPreviousMonthRelease.artist} — ${bestPreviousMonthRelease.title}`}
            />
            <div className="release-winner__body">
              <p className="eyebrow">Победитель прошлого месяца</p>
              <h3>
                {bestPreviousMonthRelease.artist} —{" "}
                {bestPreviousMonthRelease.title}
              </h3>
              <p>{bestPreviousMonthRelease.description}</p>
              <strong>
                {bestPreviousMonthRelease.averageScore.toFixed(1)} / 5
                <small> голосов: {bestPreviousMonthRelease.votesCount}</small>
              </strong>
            </div>
          </article>
        ) : (
          <div className="empty-state">
            Победитель прошлого месяца появится, когда у релизов будет
            достаточно оценок.
          </div>
        )}
      </section>
    </main>
  );
}
