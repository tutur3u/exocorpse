import {
  FaBriefcase,
  FaDesktop,
  FaHeart,
  FaInfoCircle,
  FaPalette,
  FaPencilAlt,
  FaTools,
} from "react-icons/fa";
import {
  groupAboutItemsBySection,
  type AboutPageData,
  type AboutUseIconKey,
} from "@/lib/about";
import type { ComponentType } from "react";

const useCardIconMap: Record<
  AboutUseIconKey,
  ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>
> = {
  palette: FaPalette,
  desktop: FaDesktop,
  pencil: FaPencilAlt,
};

export default function AboutTab({ data }: { data: AboutPageData }) {
  const itemsBySection = groupAboutItemsBySection(data.items);
  const aboutUseCards = itemsBySection.about_use_card;
  const experiences = itemsBySection.experience;
  const moreInfo = itemsBySection.more_info;
  const favorites = itemsBySection.favorite;

  return (
    <div className="space-y-6">
      {/* What I Use */}
      <section className="group rounded-xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-sm transition-all hover:border-cyan-400/40 hover:shadow-md">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-100">
          <FaTools className="text-blue-500" aria-hidden="true" />
          {data.settings.about_use_heading}
        </h3>
        <div className="space-y-4">
          {aboutUseCards.map((item, index) => {
            const Icon =
              useCardIconMap[(item.icon_key as AboutUseIconKey) || "palette"] ||
              FaTools;
            const iconColorClass =
              index === 0
                ? "text-purple-500"
                : index === 1
                  ? "text-green-500"
                  : "text-orange-500";

            return (
              <div
                key={item.id}
                className="rounded-lg border border-white/6 bg-slate-950/85 p-4"
              >
                <h4 className="mb-2 flex items-center gap-2 font-medium text-slate-100">
                  <Icon className={iconColorClass} aria-hidden="true" />
                  {item.title}
                </h4>
                <p className="text-sm text-slate-300">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Experiences */}
      <section className="group rounded-xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-sm transition-all hover:border-emerald-400/40 hover:shadow-md">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-100">
          <FaBriefcase className="text-green-500" aria-hidden="true" />
          {data.settings.experiences_heading}
        </h3>
        <div className="grid gap-2">
          {experiences.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-white/6 bg-slate-950/85 p-3 transition-colors hover:bg-slate-900"
            >
              <span className="text-xl">{item.icon_key}</span>
              <span className="text-sm text-slate-300">{item.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* More Information */}
      <section className="group rounded-xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-sm transition-all hover:border-fuchsia-400/40 hover:shadow-md">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-100">
          <FaInfoCircle className="text-purple-500" aria-hidden="true" />
          {data.settings.more_info_heading}
        </h3>
        <div className="grid gap-2">
          {moreInfo.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-white/6 bg-slate-950/85 p-3 transition-colors hover:bg-slate-900"
            >
              <span className="text-xl">{item.icon_key}</span>
              <span className="text-sm text-slate-300">{item.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Favorites */}
      <section className="group rounded-xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-sm transition-all hover:border-pink-400/40 hover:shadow-md">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-100">
          <FaHeart className="text-pink-500" aria-hidden="true" />
          {data.settings.favorites_heading}
        </h3>
        <div className="space-y-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="rounded-lg border border-white/6 bg-slate-950/85 p-4"
            >
              <h4 className="mb-2 flex items-center gap-2 font-medium text-slate-100">
                <span className="text-lg">{fav.icon_key}</span>
                {fav.title}
              </h4>
              <p className="text-sm text-slate-300">{fav.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
