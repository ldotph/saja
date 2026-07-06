type TurnstileResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
}

export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      success: true,
      skipped: true
    };
  }

  if (!token) {
    return {
      success: false,
      skipped: false
    };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
      cache: "no-store"
    }
  );
  const result = (await response.json()) as TurnstileResponse;

  return {
    success: Boolean(result.success),
    skipped: false,
    errors: result["error-codes"] ?? []
  };
}
