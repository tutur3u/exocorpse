import { groupAboutItemsBySection, type AboutPageData } from "@/lib/about";
import { FaInfoCircle, FaTimesCircle } from "react-icons/fa";

export default function DniTab({ data }: { data: AboutPageData }) {
  const itemsBySection = groupAboutItemsBySection(data.items);
  const dniSoft = itemsBySection.dni_soft;
  const dniHard = itemsBySection.dni_hard;

  return (
    <div className="space-y-6">
      <div className="mb-6 rounded-xl border border-red-400/20 bg-linear-to-br from-red-950/70 to-orange-950/60 p-6">
        <h2 className="bg-linear-to-r from-red-300 to-orange-200 bg-clip-text text-3xl font-bold text-transparent">
          {data.settings.dni_title}
        </h2>
        <p className="mt-2 text-sm text-slate-300">{data.settings.dni_intro}</p>
      </div>

      {/* Soft DNIs */}
      <section className="rounded-xl border border-yellow-400/35 bg-linear-to-br from-yellow-950/65 to-orange-950/55 p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-yellow-100">
          <FaInfoCircle className="h-5 w-5" />
          Soft DNIs (Preference)
        </h3>
        <div className="grid gap-2">
          {dniSoft.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-yellow-300/12 bg-yellow-950/60 p-3"
            >
              <span className="mt-0.5 text-yellow-300">•</span>
              <span className="text-sm text-yellow-100/88">{item.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hard DNIs */}
      <section className="rounded-xl border border-red-400/35 bg-linear-to-br from-red-950/68 to-pink-950/58 p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-red-100">
          <FaTimesCircle className="h-5 w-5" />
          Hard DNIs (Hardblock)
        </h3>
        <div className="grid gap-2">
          {dniHard.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-red-300/12 bg-red-950/60 p-3"
            >
              <FaTimesCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
              <span className="text-sm text-red-100/88">{item.body}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
