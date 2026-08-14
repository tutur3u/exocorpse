import { createHmac, timingSafeEqual } from "node:crypto";

const AVATAR_UPLOAD_PROOF_TTL_MS = 5 * 60 * 1000;

type Payload = {
  exp: number;
  filePath: string;
  publicUrl: string;
  userId: string;
};

function secret() {
  const value =
    process.env.EXOCORPSE_SESSION_SECRET ?? process.env.EXOCORPSE_APP_SECRET;
  if (!value?.trim()) throw new Error("Exocorpse session secret is required.");
  return value.trim();
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createAvatarUploadProof(input: {
  filePath: string;
  publicUrl: string;
  userId: string;
}) {
  const encoded = Buffer.from(
    JSON.stringify({
      exp: Date.now() + AVATAR_UPLOAD_PROOF_TTL_MS,
      ...input,
    } satisfies Payload),
  ).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAvatarUploadProof(input: {
  proof: string;
  publicUrl: string;
  userId: string;
}) {
  const [encoded, suppliedSignature] = input.proof.split(".");
  if (!encoded || !suppliedSignature) return false;
  const expectedSignature = sign(encoded);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return false;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<Payload>;
    return (
      typeof payload.exp === "number" &&
      payload.exp >= Date.now() &&
      payload.publicUrl === input.publicUrl &&
      payload.userId === input.userId &&
      typeof payload.filePath === "string" &&
      payload.filePath.length > 0
    );
  } catch {
    return false;
  }
}
