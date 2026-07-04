import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_BASE_PATH } from "@/lib/cms/constants";

const COOKIE_NAME = "saja_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "change-this-saja-session-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminCredentials(login: string, password: string) {
  const expectedLogin = process.env.ADMIN_LOGIN || "sazhafm";
  const expectedPassword = process.env.ADMIN_PASSWORD || "ratusha";

  return (
    safeCompare(login, expectedLogin) && safeCompare(password, expectedPassword)
  );
}

export async function setAdminSession() {
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${issuedAt}.${signature}`, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: ADMIN_BASE_PATH,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: COOKIE_NAME,
    path: ADMIN_BASE_PATH
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  const [issuedAt, signature] = session.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const issuedAtMs = Number(issuedAt);
  const isExpired = Date.now() - issuedAtMs > SESSION_MAX_AGE * 1000;

  if (!Number.isFinite(issuedAtMs) || isExpired) {
    return false;
  }

  return safeCompare(signature, sign(issuedAt));
}

