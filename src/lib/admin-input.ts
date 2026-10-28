export class AdminInputError extends Error {
  readonly status = 400;
}

export function adminId(value: string) {
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(value)) {
    throw new AdminInputError("Invalid identifier.");
  }
  return value;
}

export function storagePath(value: string) {
  if (
    !value ||
    value.length > 1024 ||
    value.includes("..") ||
    /[%\\\p{Cc}\p{Cf}]/u.test(value) ||
    value.split("/").some((part) => !part || part === ".")
  )
    throw new AdminInputError("Invalid storage path.");
  return value;
}

export function drivePath(value: string, allowOverview = false) {
  if (allowOverview && value === "") return value;
  storagePath(value);
  if (value !== "drive/root" && !value.startsWith("drive/root/")) {
    throw new AdminInputError("Path must be under Managed Drive.");
  }
  return value;
}

export function storageName(value: string) {
  storagePath(value);
  if (!/^[\p{L}\p{N}][\p{L}\p{N}._ -]{0,159}$/u.test(value)) {
    throw new AdminInputError("Invalid storage name.");
  }
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
