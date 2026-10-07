import { adminPageIcon } from "./admin-navigation";
import type { ReactNode } from "react";

export default function AdminPageHeader({
  actions,
  description,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  title: string;
}) {
  const Icon = adminPageIcon(title);
  return (
    <header className="flex flex-col gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Icon
            className="size-5 shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
