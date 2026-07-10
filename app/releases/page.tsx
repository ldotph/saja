import type { Metadata } from "next";
import { ReleaseVoteForm } from "@/components/release-vote-form";
import { SiteNav } from "@/components/site-nav";
import {
  listPublishedReleaseRecords,
  listReleaseLeaderboards
} from "@/lib/cms/storage";
import type { ReleaseRecord } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Релизы недели — САЖА",
  description: "Подборка релизов недели с пользовательским рейтингом."
};

function Leaderboard({
  title,
  releases
}: {
  title: string;
  releases: ReleaseRecord[];
}) {
  return (
    <div className="release-leaderboard">
      <h3>{title}</h3>
      {releases.length > 0 ? (
        <ol>
          {releases.map((release) => (
            <li key={release.id}>
              <span>
                {release.artist} — {release.title}
              </span>
              <strong>
                {release.averageScore.toFixed(1)} / 5
                <small> голосов: {release.votesCount}</small>
              </strong>
            </li>
          ))}
        </ol>
      ) : (
        <p>Пока не хватает голосов для рейтинга.</p>
      )}
    </div>
  );
}

export default async function ReleasesPage() {
  const [releases, leaderboards] = await Promise.all([
    listPublishedReleaseRecords(),
    listReleaseLeaderboards()
  ]);

  return (
    <main className="page-shell releases-page">
      <SiteNav active="releases" />
      <section className="releases-hero">
        <p className="eyebrow">Слушаем и спорим</p>
        <h1>Релизы недели</h1>
        <p>
          Подборка альбомов от САЖИ. Оцените релизы от 1 до 5: общий рейтинг
          пересобирается автоматически и учитывает не только среднюю оценку, но
          и количество голосов.
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

      <section className="releases-section" aria-labelledby="leaders-title">
        <div className="section-heading">
          <p className="eyebrow">Архив рейтингов</p>
          <h2 id="leaders-title">Лидеры по оценкам</h2>
          <p className="section-copy">
            В лидерстве используется взвешенная формула: релизу с одним
            идеальным голосом сложнее обогнать альбом, который стабильно высоко
            оценили десятки слушателей.
          </p>
        </div>
        <div className="release-leaderboards">
          <Leaderboard
            title="Прошлая неделя"
            releases={leaderboards.previousWeek}
          />
          <Leaderboard
            title="Последние 30 дней"
            releases={leaderboards.lastThirtyDays}
          />
        </div>
      </section>
    </main>
  );
}
