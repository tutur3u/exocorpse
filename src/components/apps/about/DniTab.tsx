import { FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { dniHard, dniSoft } from "./data";

export default function DniTab() {
  return (
    <div className="space-y-6">
      <div className="mb-6 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 p-6 dark:from-red-950 dark:to-orange-950">
        <h2 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-3xl font-bold text-transparent dark:from-red-400 dark:to-orange-400">
          Do Not Interact
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please respect these boundaries
        </p>
      </div>

      {/* Soft DNIs */}
      <section className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-lg dark:border-yellow-700 dark:from-yellow-950 dark:to-orange-950">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-yellow-900 dark:text-yellow-100">
          <FaInfoCircle className="h-5 w-5" />
          Soft DNIs (Preference)
        </h3>
        <div className="grid gap-2">
          {dniSoft.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900"
            >
              <span className="mt-0.5 text-yellow-600 dark:text-yellow-400">
                •
              </span>
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Hard DNIs */}
      <section className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-lg dark:border-red-700 dark:from-red-950 dark:to-pink-950">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-red-900 dark:text-red-100">
          <FaTimesCircle className="h-5 w-5" />
          Hard DNIs (Hardblock)
        </h3>
        <div className="grid gap-2">
          {dniHard.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-lg bg-red-100 p-3 dark:bg-red-900"
            >
              <FaTimesCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200">
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
