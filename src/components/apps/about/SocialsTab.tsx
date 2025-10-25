import { socialMediaLinks } from "./data";
import SocialLink from "./SocialLink";

export default function SocialsTab() {
  return (
    <div className="space-y-6">
      <div className="mb-6 rounded-xl bg-linear-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950 dark:to-purple-950">
        <h2 className="mb-3 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
          Social Media
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find me on these platforms! All usernames are either{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            exocorpse
          </span>{" "}
          or{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            exocorpsehq
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
