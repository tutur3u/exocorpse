export const EXOCORPSE_APP_NAME = "exocorpse";

export type ExocorpseAdminTargetKey =
  | "dashboard"
  | "library"
  | "preview"
  | "members"
  | "settings";

type ExocorpseAdminTarget = {
  actionLabel: string;
  description: string;
  key: ExocorpseAdminTargetKey;
  label: string;
  pathSuffix: string;
};

export const EXOCORPSE_ADMIN_TARGETS: ExocorpseAdminTarget[] = [
  {
    actionLabel: "Open CMS Home",
    description: "Review workspace status and migration reports.",
    key: "dashboard",
    label: "CMS Home",
    pathSuffix: "",
  },
  {
    actionLabel: "Manage Library",
    description: "Edit migrated wiki, portfolio, blog, and commission content.",
    key: "library",
    label: "Library",
    pathSuffix: "/library",
  },
  {
    actionLabel: "Preview Delivery",
    description: "Inspect the centralized Exocorpse delivery payload.",
    key: "preview",
    label: "Preview",
    pathSuffix: "/preview",
  },
  {
    actionLabel: "Manage Members",
    description: "Open CMS workspace membership and collaborator access.",
    key: "members",
    label: "Members",
    pathSuffix: "/members",
  },
  {
    actionLabel: "Open Settings",
    description: "Tune the external project binding and migration settings.",
    key: "settings",
    label: "Settings",
    pathSuffix: "/settings",
  },
];

function isEnabled(value: string | undefined) {
  return value
    ? ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())
    : false;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getAdminDevMode() {
  return isEnabled(process.env.DEV_MODE ?? process.env.NEXT_PUBLIC_DEV_MODE);
}

function getConfiguredUrl({
  envName,
  localUrl,
  productionUrl,
}: {
  envName: string;
  localUrl: string;
  productionUrl: string;
}) {
  const configured =
    process.env[envName] ?? process.env[`NEXT_PUBLIC_${envName}`];

  if (configured?.trim()) {
    return trimTrailingSlash(configured.trim());
  }

  return getAdminDevMode() ? localUrl : productionUrl;
}

export function getExocorpseApiBaseUrl() {
  return (
    process.env.TUTURUUU_API_BASE_URL ??
    process.env.NEXT_PUBLIC_TUTURUUU_API_BASE_URL ??
    "https://tuturuuu.com/api/v1"
  );
}

export function getExocorpseWorkspaceId() {
  const workspaceId =
    process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID ??
    process.env.NEXT_PUBLIC_TUTURUUU_EXOCORPSE_WORKSPACE_ID;

  if (!workspaceId?.trim()) {
    throw new Error("[exocorpse] Missing TUTURUUU_EXOCORPSE_WORKSPACE_ID.");
  }

  return workspaceId.trim();
}

export function getExocorpseAppId() {
  return (process.env.EXOCORPSE_APP_ID ?? EXOCORPSE_APP_NAME)
    .trim()
    .toLowerCase();
}

export function getExocorpseAppSecret() {
  const secret =
    process.env.EXOCORPSE_APP_SECRET ??
    process.env.TUTURUUU_EXOCORPSE_APP_SECRET;

  if (!secret?.trim()) {
    throw new Error("[exocorpse] Missing EXOCORPSE_APP_SECRET.");
  }

  return secret.trim();
}

export function getExocorpseCmsBaseUrl() {
  return getConfiguredUrl({
    envName: "TUTURUUU_CMS_APP_URL",
    localUrl: "http://localhost:7811",
    productionUrl: "https://cms.tuturuuu.com",
  });
}

export function getExocorpseWebAppUrl() {
  return getConfiguredUrl({
    envName: "TUTURUUU_WEB_APP_URL",
    localUrl: "http://localhost:7803",
    productionUrl: "https://tuturuuu.com",
  });
}

export function getExocorpseAppBaseUrl(requestOrigin?: string) {
  const configured =
    process.env.EXOCORPSE_APP_URL ??
    process.env.NEXT_PUBLIC_EXOCORPSE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL;

  if (configured?.trim()) {
    return trimTrailingSlash(configured.trim());
  }

  if (requestOrigin?.trim()) {
    return trimTrailingSlash(requestOrigin.trim());
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${trimTrailingSlash(process.env.VERCEL_URL.trim())}`;
  }

  return "http://localhost:3000";
}

export function sanitizeExocorpseNextPath(
  rawValue: string | null | undefined,
  requestOrigin = "http://localhost",
  fallbackPath = "/admin",
) {
  if (!rawValue?.trim() || rawValue.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(rawValue, requestOrigin);

    if (parsed.origin !== requestOrigin) {
      return fallbackPath;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallbackPath;
  }
}

export function resolveExocorpseAdminTargetKey(
  value: string | null | undefined,
): ExocorpseAdminTargetKey {
  return EXOCORPSE_ADMIN_TARGETS.some((target) => target.key === value)
    ? (value as ExocorpseAdminTargetKey)
    : "library";
}

export function getExocorpseAdminTarget(key: ExocorpseAdminTargetKey) {
  return (
    EXOCORPSE_ADMIN_TARGETS.find((target) => target.key === key) ??
    EXOCORPSE_ADMIN_TARGETS[1]
  );
}

export function getExocorpseCmsWorkspacePath(
  targetKey: ExocorpseAdminTargetKey,
  workspaceId = getExocorpseWorkspaceId(),
) {
  const target = getExocorpseAdminTarget(targetKey);
  return `/${encodeURIComponent(workspaceId)}${target.pathSuffix}`;
}

export function buildExocorpseCmsUrl({
  cmsBaseUrl = getExocorpseCmsBaseUrl(),
  targetKey,
  workspaceId = getExocorpseWorkspaceId(),
}: {
  cmsBaseUrl?: string;
  targetKey: ExocorpseAdminTargetKey;
  workspaceId?: string;
}) {
  return new URL(
    getExocorpseCmsWorkspacePath(targetKey, workspaceId),
    cmsBaseUrl,
  ).toString();
}

export function buildExocorpseCentralizedLoginUrl({
  appBaseUrl = getExocorpseAppBaseUrl(),
  nextUrl = "/admin",
  webAppUrl = getExocorpseWebAppUrl(),
}: {
  appBaseUrl?: string;
  nextUrl?: string;
  webAppUrl?: string;
}) {
  const appOrigin = new URL(appBaseUrl).origin;
  const verifyUrl = new URL("/verify-token", appOrigin);
  verifyUrl.searchParams.set(
    "nextUrl",
    sanitizeExocorpseNextPath(nextUrl, appOrigin),
  );

  const loginUrl = new URL("/login", webAppUrl);
  loginUrl.searchParams.set("returnUrl", verifyUrl.toString());
  return loginUrl.toString();
}

export function getExocorpseAdminLoginPath(targetKey: ExocorpseAdminTargetKey) {
  return `/admin/tuturuuu/login?next=${encodeURIComponent(targetKey)}`;
}

export function buildExocorpseAdminLinks(
  workspaceId = getExocorpseWorkspaceId(),
) {
  const cmsBaseUrl = getExocorpseCmsBaseUrl();

  return EXOCORPSE_ADMIN_TARGETS.map((target) => ({
    ...target,
    cmsHref: buildExocorpseCmsUrl({
      cmsBaseUrl,
      targetKey: target.key,
      workspaceId,
    }),
    loginHref: getExocorpseAdminLoginPath(target.key),
  }));
}
