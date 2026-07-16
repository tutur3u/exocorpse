import ArtfightProfilePreviewClient from "./ArtfightProfilePreviewClient";
import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const metadata: Metadata = {
  title: "Artfight Profile - EXOCORPSE",
  description:
    "Preview and copy the official EXOCORPSE ArtFight profile HTML and CSS.",
};

const PROFILE_DIR = path.join(process.cwd(), "artfight-profile");
const MANIFEST_PATH = path.join(PROFILE_DIR, "versions", "manifest.json");

type ProfileVersionStatus = "current" | "archived";

type ProfileVersionManifestEntry = {
  id: string;
  label: string;
  date: string;
  status: ProfileVersionStatus;
  summary: string;
  files: {
    inlineHtml: string;
    supporterHtml: string;
    supporterCss: string;
    readme: string;
  };
};

async function readProfileFile(relativePath: string) {
  const resolvedPath = path.resolve(PROFILE_DIR, relativePath);

  if (!resolvedPath.startsWith(`${PROFILE_DIR}${path.sep}`)) {
    throw new Error(
      `Refusing to read outside artfight-profile: ${relativePath}`,
    );
  }

  return readFile(resolvedPath, "utf8");
}

async function readVersionManifest() {
  const manifest = JSON.parse(
    await readFile(MANIFEST_PATH, "utf8"),
  ) as ProfileVersionManifestEntry[];

  return [...manifest].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "current" ? -1 : 1;
  });
}

export default async function ArtfightProfilePage() {
  const manifest = await readVersionManifest();
  const versions = await Promise.all(
    manifest.map(async (version) => {
      const [inlineHtml, supporterHtml, supporterCss, readme] =
        await Promise.all([
          readProfileFile(version.files.inlineHtml),
          readProfileFile(version.files.supporterHtml),
          readProfileFile(version.files.supporterCss),
          readProfileFile(version.files.readme),
        ]);

      return {
        id: version.id,
        label: version.label,
        date: version.date,
        status: version.status,
        summary: version.summary,
        inlineHtml,
        supporterHtml,
        supporterCss,
        readme,
      };
    }),
  );

  return <ArtfightProfilePreviewClient versions={versions} />;
}
