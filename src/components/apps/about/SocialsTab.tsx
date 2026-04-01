import { groupAboutItemsBySection, type AboutPageData } from "@/lib/about";
import SocialLink from "./SocialLink";

export default function SocialsTab({ data }: { data: AboutPageData }) {
  const socialMediaLinks = groupAboutItemsBySection(data.items).social_link;

  return (
    <div className="space-y-6">
      <div className="mb-6 rounded-xl border border-cyan-400/18 bg-linear-to-br from-cyan-950/60 to-fuchsia-950/45 p-6">
        <h2 className="mb-3 bg-linear-to-r from-cyan-200 to-fuchsia-300 bg-clip-text text-3xl font-bold text-transparent">
          {data.settings.socials_title}
        </h2>
        <p className="text-slate-300">
          {data.settings.socials_intro}{" "}
          <span className="font-semibold text-cyan-300">
            {data.settings.socials_primary_username}
          </span>{" "}
          or{" "}
          <span className="font-semibold text-fuchsia-300">
            {data.settings.socials_secondary_username}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {socialMediaLinks.map((link) => (
          <SocialLink key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}
