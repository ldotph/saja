import type { Metadata } from "next";
import { ReleaseVoteForm } from "@/components/release-vote-form";
import { listPublishedReleaseRecords } from "@/lib/cms/storage";
import { getTurnstileSiteKey } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Релизы недели — САЖА",
  description: "Тестовая подборка релизов недели с пользовательским рейтингом."
};

export default async function ReleasesLabPage() {
  const [releases, turnstileSiteKey] = await Promise.all([
    listPublishedReleaseRecords(),
    Promise.resolve(getTurnstileSiteKey())
  ]);

  return (
    <main className="page-shell releases-page">
      <section className="releases-hero">
        <p className="eyebrow">Тестовый раздел</p>
        <h1>Релизы недели</h1>
        <p>
          Подборка альбомов от САЖИ. Оцените релизы от 1 до 10: общий рейтинг
          пересобирается автоматически на основе голосов.
        </p>
      </section>

      <section className="releases-section" aria-labelledby="releases-title">
        <div className="section-heading">
          <p className="eyebrow">Рейтинг слушателей</p>
          <h2 id="releases-title">10 альбомов недели</h2>
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
                    turnstileSiteKey={turnstileSiteKey}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Релизы недели пока не опубликованы. Добавьте их в панели
            администратора.
          </div>
        )}
      </section>
    </main>
  );
}
