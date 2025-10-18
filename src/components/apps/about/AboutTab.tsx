import {
  FaBriefcase,
  FaDesktop,
  FaExternalLinkAlt,
  FaHeart,
  FaInfoCircle,
  FaLink,
  FaPalette,
  FaPencilAlt,
  FaTools,
  FaYoutube,
} from "react-icons/fa";
import { MdDeveloperMode } from "react-icons/md";
import { SiCanva } from "react-icons/si";
import { experiences, favorites, importantLinks, moreInfo } from "./data";

const importantLinkIcons = {
  dev: MdDeveloperMode,
  canva: SiCanva,
  youtube: FaYoutube,
};

export default function AboutTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950 dark:to-purple-950">
        <h2 className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
          About Me
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Hi! I&apos;m <strong>Fenrys</strong> (also known as{" "}
          <strong>Morris</strong>), a self-taught artist and writer passionate
          about storytelling and visual art.
        </p>
      </div>

      {/* Important Links */}
      <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <FaLink className="text-indigo-500" />
          Important Links
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {importantLinks.map((link) => {
            const Icon = importantLinkIcons[link.icon];
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/link flex items-center gap-3 rounded-lg bg-gradient-to-r ${link.gradient} p-4 transition-all hover:${link.gradient.replace(/50/g, "100").replace(/950/g, "900")} dark:${link.gradient.replace(/50/g, "950")} dark:hover:${link.gradient.replace(/50/g, "900").replace(/950/g, "800")} ${link.fullWidth ? "sm:col-span-2" : ""}`}
              >
                <Icon className={`h-6 w-6 ${link.iconColor}`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {link.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {link.subtitle}
                  </p>
                </div>
                <FaExternalLinkAlt
                  className={`h-3 w-3 text-gray-400 transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 ${link.iconColor.replace("dark:", "dark:group-hover/link:")}`}
                />
              </a>
            );
          })}
        </div>
      </section>

      {/* What I Use */}
      <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <FaTools className="text-blue-500" />
          What I Use
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <FaPalette className="text-purple-500" />
              Programs
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Procreate, Clip Studio Paint, Paint Tool Sai V2
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <FaDesktop className="text-green-500" />
              Tools
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              iPad Pro 12.9 inch 5th Gen, XP-Pen Artist Pro 24 165 Hz 2nd Gen
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <FaPencilAlt className="text-orange-500" />
              Other Stuff
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vegas Pro 17 (video editing), Live2D + After Effects (puppeting)
            </p>
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <FaBriefcase className="text-green-500" />
          Experiences
        </h3>
        <div className="grid gap-2">
          {experiences.map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* More Information */}
      <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <FaInfoCircle className="text-purple-500" />
          More Information
        </h3>
        <div className="grid gap-2">
          {moreInfo.map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Favorites */}
      <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-pink-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-pink-600">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <FaHeart className="text-pink-500" />
          Favorites
        </h3>
        <div className="space-y-4">
          {favorites.map((fav) => (
            <div
              key={fav.label}
              className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
            >
              <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                <span className="text-lg">{fav.icon}</span>
                {fav.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fav.items}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
