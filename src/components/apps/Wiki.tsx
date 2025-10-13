export default function Wiki() {
  return (
    <div className="h-full overflow-auto p-6">
      <h2 className="mb-4 text-2xl font-bold">Character & World Wiki</h2>
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-xl font-semibold">Characters</h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold">Pulse Division</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The physically dominant branch of EXOCORPSE, specializing in
                direct action and combat operations.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold">Neuro Division</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The intellectually cunning branch, handling strategy,
                intelligence, and covert operations.
              </p>
            </div>
          </div>
        </section>
        <section>
          <h3 className="mb-3 text-xl font-semibold">World</h3>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed world-building content will be displayed here, fetched
              from the database.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
