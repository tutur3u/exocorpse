import {
  FaBriefcase,
  FaDesktop,
  FaHeart,
  FaInfoCircle,
  FaPalette,
  FaPencilAlt,
  FaTools,
} from "react-icons/fa";
import { experiences, favorites, moreInfo } from "./data";

export default function AboutTab() {
  return (
    <div className="space-y-6">
      {/* What I Use */}
      <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <FaTools className="text-blue-500" aria-hidden="true" />
          What I Use
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <FaPalette className="text-purple-500" aria-hidden="true" />
              Programs
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Procreate, Clip Studio Paint, Paint Tool Sai V2
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <FaDesktop className="text-green-500" aria-hidden="true" />
              Tools
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              iPad Pro 12.9 inch 5th Gen, XP-Pen Artist Pro 24 165 Hz 2nd Gen
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <FaPencilAlt className="text-orange-500" aria-hidden="true" />
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
          <FaBriefcase className="text-green-500" aria-hidden="true" />
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
          <FaInfoCircle className="text-purple-500" aria-hidden="true" />
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
          <FaHeart className="text-pink-500" aria-hidden="true" />
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
