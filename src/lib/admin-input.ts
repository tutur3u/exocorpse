export class AdminInputError extends Error {
  readonly status = 400;
}

export function adminId(value: string) {
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(value)) {
    throw new AdminInputError("Invalid identifier.");
  }
  return value;
}

export function storagePath(value: string, allowRoot = false) {
  if (allowRoot && value === "") return value;
  if (
    value.length > 1024 ||
    value.includes("..") ||
    !value
      .split("/")
      .every((part) => /^[\p{L}\p{N}][\p{L}\p{N}._ -]{0,159}$/u.test(part))
  )
    throw new AdminInputError("Invalid storage path.");
  return value;
}

export function adminErrorResponse(error: unknown) {
  const status =
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;
  return Response.json(
    {
      error:
        status === 400
          ? "Invalid request."
          : status === 401
            ? "Sign in required."
            : "Admin request failed.",
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
