"use client";

import { useState } from "react";

type ReleaseVoteFormProps = {
  releaseId: string;
  initialAverageScore: number;
  initialVotesCount: number;
};

type VoteResponse = {
  message: string;
  rating?: {
    averageScore: number;
    weightedScore: number;
    votesCount: number;
  };
};

function formatRating(averageScore: number, votesCount: number) {
  if (votesCount === 0) {
    return "Пока нет оценок";
  }

  return `${averageScore.toFixed(1)} / 5`;
}

export function ReleaseVoteForm({
  releaseId,
  initialAverageScore,
  initialVotesCount
}: ReleaseVoteFormProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [humanCheck, setHumanCheck] = useState("");
  const [averageScore, setAverageScore] = useState(initialAverageScore);
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"muted" | "success" | "error">("muted");
  const [isPending, setIsPending] = useState(false);

  async function submitVote() {
    if (selectedScore === null) {
      setTone("error");
      setMessage("Выберите оценку от 1 до 5.");
      return;
    }

    if (!humanCheck.trim()) {
      setTone("error");
      setMessage("Введите слово САЖА, чтобы подтвердить голос.");
      return;
    }

    setIsPending(true);
    setTone("muted");
    setMessage("Сохраняем оценку...");

    try {
      const response = await fetch("/api/releases/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          releaseId,
          score: selectedScore,
          humanCheck
        })
      });
      const result = (await response.json()) as VoteResponse;

      if (!response.ok) {
        throw new Error(result.message);
      }

      if (result.rating) {
        setAverageScore(result.rating.averageScore);
        setVotesCount(result.rating.votesCount);
      }

      setTone("success");
      setMessage(result.message);
      setHumanCheck("");
    } catch (error) {
      setTone("error");
      setMessage(
        error instanceof Error ? error.message : "Не удалось сохранить оценку."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="release-vote">
      <div className="release-vote__rating">
        <span>{formatRating(averageScore, votesCount)}</span>
        <small>
          {votesCount > 0
            ? `Голосов: ${votesCount}`
            : "Будьте первым, кто оценит"}
        </small>
      </div>
      <div className="release-vote__scale" aria-label="Оценка от 1 до 5">
        {Array.from({ length: 5 }, (_, index) => index + 1).map((score) => (
          <button
            key={score}
            className="release-vote__score"
            type="button"
            aria-pressed={selectedScore === score}
            onClick={() => {
              setSelectedScore(score);
              setMessage("");
            }}
          >
            {score}
          </button>
        ))}
      </div>
      {selectedScore !== null ? (
        <div className="release-vote__confirm">
          <label className="release-vote__human-check">
            <span>Введите слово САЖА</span>
            <input
              type="text"
              value={humanCheck}
              placeholder="САЖА"
              autoComplete="off"
              onChange={(event) => {
                setHumanCheck(event.target.value);
                setMessage("");
              }}
            />
          </label>
          <button
            className="release-vote__submit"
            type="button"
            disabled={isPending}
            onClick={submitVote}
          >
            Оценить на {selectedScore}
          </button>
        </div>
      ) : null}
      {message ? (
        <div className="release-vote__message" data-tone={tone}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
