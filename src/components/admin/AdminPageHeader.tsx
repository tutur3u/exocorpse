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
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
