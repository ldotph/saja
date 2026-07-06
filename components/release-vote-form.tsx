"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type ReleaseVoteFormProps = {
  releaseId: string;
  initialAverageScore: number;
  initialVotesCount: number;
  turnstileSiteKey: string;
};

type VoteResponse = {
  message: string;
  rating?: {
    averageScore: number;
    votesCount: number;
  };
};

const scriptId = "cloudflare-turnstile-script";

function loadTurnstileScript(onReady: () => void) {
  if (window.turnstile) {
    onReady();
    return;
  }

  const existingScript = document.getElementById(scriptId);

  if (existingScript) {
    existingScript.addEventListener("load", onReady, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;
  script.addEventListener("load", onReady, { once: true });
  document.head.appendChild(script);
}

function formatRating(averageScore: number, votesCount: number) {
  if (votesCount === 0) {
    return "Пока нет оценок";
  }

  return `${averageScore.toFixed(1)} / 10`;
}

export function ReleaseVoteForm({
  releaseId,
  initialAverageScore,
  initialVotesCount,
  turnstileSiteKey
}: ReleaseVoteFormProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [averageScore, setAverageScore] = useState(initialAverageScore);
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"muted" | "success" | "error">("muted");
  const [isPending, setIsPending] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!turnstileSiteKey || selectedScore === null || widgetIdRef.current) {
      return;
    }

    let isCancelled = false;

    loadTurnstileScript(() => {
      if (isCancelled || !turnstileRef.current || !window.turnstile) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        callback: setTurnstileToken,
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken("")
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedScore, turnstileSiteKey]);

  async function submitVote() {
    if (selectedScore === null) {
      setTone("error");
      setMessage("Выберите оценку от 1 до 10.");
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setTone("error");
      setMessage("Сначала подтвердите, что вы человек.");
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
          turnstileToken
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
      setTurnstileToken("");
      window.turnstile?.reset(widgetIdRef.current ?? undefined);
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
      <div className="release-vote__scale" aria-label="Оценка от 1 до 10">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
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
          {turnstileSiteKey ? (
            <div ref={turnstileRef} className="release-vote__turnstile" />
          ) : (
            <div className="release-vote__dev-note">
              Капча выключена в локальном режиме.
            </div>
          )}
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
