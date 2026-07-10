import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseReleaseScore, voteForRelease } from "@/lib/cms/storage";

const VOTER_COOKIE = "saja_release_voter";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type VotePayload = {
  releaseId?: string;
  score?: number;
  humanCheck?: string;
};

function isHumanCheckPassed(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е") === "сажа";
}

function createVoterHash(voterId: string, userAgent: string) {
  const salt =
    process.env.RELEASE_VOTE_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    "saja-release-vote";

  return createHash("sha256")
    .update(`${voterId}:${userAgent}:${salt}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as VotePayload;
    const releaseId = String(payload.releaseId ?? "").trim();
    const score = parseReleaseScore(payload.score);

    if (!releaseId) {
      return NextResponse.json(
        { message: "Релиз не найден." },
        { status: 400 }
      );
    }

    if (!isHumanCheckPassed(payload.humanCheck)) {
      return NextResponse.json(
        { message: "Введите слово САЖА, чтобы подтвердить голос." },
        { status: 400 }
      );
    }

    let voterId = request.cookies.get(VOTER_COOKIE)?.value;
    const shouldSetCookie = !voterId;

    if (!voterId) {
      voterId = randomUUID();
    }

    const voterHash = createVoterHash(
      voterId,
      request.headers.get("user-agent") ?? ""
    );
    const rating = await voteForRelease(releaseId, score, voterHash);
    const response = NextResponse.json({
      message: "Оценка учтена.",
      rating
    });

    if (shouldSetCookie) {
      response.cookies.set(VOTER_COOKIE, voterId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ONE_YEAR_SECONDS,
        path: "/"
      });
    }

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось сохранить оценку.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
