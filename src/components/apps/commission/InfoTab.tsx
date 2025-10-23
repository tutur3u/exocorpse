"use client";

export default function InfoTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Commission Information</h2>
      <p>
        Welcome! I&apos;m currently accepting commissions for writing and art
        projects.
      </p>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">What I Offer:</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>Character illustrations</li>
          <li>World-building narratives</li>
          <li>Custom artwork</li>
          <li>Story writing</li>
        </ul>
      </div>
    </div>
  );
}
