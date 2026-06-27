import ArtfightProfilePreviewClient from "./ArtfightProfilePreviewClient";
import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Artfight Profile - EXOCORPSE",
  description:
    "Preview and copy the official EXOCORPSE ArtFight profile HTML and CSS.",
};

const PROFILE_DIR = path.join(process.cwd(), "artfight-profile");

async function readProfileFile(fileName: string) {
  return readFile(path.join(PROFILE_DIR, fileName), "utf8");
}

export default async function ArtfightProfilePage() {
  const [inlineHtml, supporterHtml, supporterCss, readme] = await Promise.all([
    readProfileFile("inline-html.html"),
    readProfileFile("supporter-css.html"),
    readProfileFile("supporter-profile.css"),
    readProfileFile("README.md"),
  ]);

  return (
    <ArtfightProfilePreviewClient
      source={{
        inlineHtml,
        supporterHtml,
        supporterCss,
        readme,
      }}
    />
  );
}
