"use client";

import { useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaTimesCircle,
} from "react-icons/fa";
import type { FaqItem } from "./data";
import { artistInspiration, clipStudioBrushes, faqs } from "./data";

export default function FaqTab() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const renderFaqAnswer = (faq: FaqItem) => {
    switch (faq.type) {
      case "programs":
        return (
          <div className="space-y-2">
            <p>
              <strong>PROGRAMS:</strong>{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                Paint Tool Sai V2
              </code>
              ,{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                Clip Studio Paint
              </code>{" "}
              &{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                Procreate
              </code>
            </p>
            <p>
              <strong>DEVICES:</strong>{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                XP-Pen Artist Pro 24 165Hz Gen 2
              </code>{" "}
              &{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                iPad Pro 12.9&quot; 5th Gen
              </code>
            </p>
            <p>
              <strong>OTHER STUFF:</strong>
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>Video Editing / Puppeting:</strong>{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                  Vegas Pro 17
                </code>
                ,{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                  After Effects
                </code>
                ,{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                  Live2D
                </code>
              </li>
              <li>
                <strong>Writing:</strong>{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                  Ellipsus
                </code>{" "}
                &{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                  ZenWriter
                </code>
              </li>
            </ul>
          </div>
        );

      case "brushes":
        return (
          <div className="space-y-3">
            <div>
              <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                CLIP STUDIO PAINT:
              </p>
              <div className="ml-4 space-y-2 text-sm">
                <div>
                  <p className="mb-1 font-medium">Inside Clip Studio Assets:</p>
                  <div className="flex flex-wrap gap-2">
                    {clipStudioBrushes.inside.map((brush) =>
                      brush.url ? (
                        <a
                          key={brush.name}
                          href={brush.url ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                          {brush.name} <FaExternalLinkAlt className="h-2 w-2" />
                        </a>
                      ) : (
                        <span
                          key={brush.name}
                          className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {brush.name}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-1 font-medium">
                    Outside Clip Studio Assets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {clipStudioBrushes.outside.map((brush) => (
                      <a
                        key={brush.name}
                        href={brush.url ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                      >
                        {brush.name} <FaExternalLinkAlt className="h-2 w-2" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                PROCREATE:
              </p>
              <p className="ml-4 text-sm">
                Feast&apos;s Paint & Pencil Brushes, Tinderbox, Derwent,
                Dan092&apos;s Set
              </p>
            </div>
            <div>
              <p className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                PAINT TOOL SAI:
              </p>
              <p className="ml-4 text-sm">
                Pencil brush with the Fuzystatic Texture
              </p>
            </div>
          </div>
        );

      case "permissions":
        return (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
              <p className="mb-2 flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                <FaCheckCircle /> ALLOWED
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-green-800 dark:text-green-200">
                <li>
                  <strong>
                    Profile layouts / video edits / fanfiction, personal
                    printing:
                  </strong>{" "}
                  All OK!{" "}
                  <span className="underline">
                    Make sure it has direct credit to me!
                  </span>
                </li>
                <li>
                  <strong>Material for learning / studying:</strong> All OK!
                  Make sure it has direct credit to me (and tag me too! I&apos;d
                  love to see it)
                </li>
                <li>
                  <strong>Reposting:</strong> Only with direct credit to me,
                  otherwise prohibited
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
              <p className="mb-2 flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
                <FaTimesCircle /> PROHIBITED
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-red-800 dark:text-red-200">
                <li>
                  <strong>Commercial printing:</strong> Prohibited,{" "}
                  <em>
                    unless you&apos;re a client that has purchased said rights
                    to an artwork you&apos;ve commissioned from me
                  </em>
                </li>
                <li>
                  <strong>Edits on artwork, AI and NFT:</strong> Prohibited
                </li>
              </ul>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-2">
            <p>
              All my usernames are either <strong>exocorpse</strong> or{" "}
              <strong>exocorpsehq</strong>, nothing else.
            </p>
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 py-2 pl-4 text-sm italic dark:bg-blue-950">
              I only list ones where I&apos;m active on, but if they don&apos;t
              have{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 not-italic dark:bg-gray-700">
                Fenrys & Morris
              </code>{" "}
              as the display name, that is not me.
            </blockquote>
          </div>
        );

      case "assets":
        return (
          <div className="space-y-2">
            <p>
              <strong>Logo:</strong>{" "}
              <a
                href="https://vgen.co/PrimaRoxas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-500 hover:underline"
              >
                PrimaRoxas <FaExternalLinkAlt className="h-3 w-3" />
              </a>
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a
                href="https://tuturuuu.com/?no-redirect=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-500 hover:underline"
              >
                Tuturuuu <FaExternalLinkAlt className="h-3 w-3" />
              </a>
            </p>
          </div>
        );

      case "artists":
        return (
          <div className="flex flex-wrap gap-2">
            {artistInspiration.map((artist) => (
              <span
                key={artist}
                className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-200"
              >
                {artist}
              </span>
            ))}
          </div>
        );

      case "commissions":
        return (
          <p>
            Please check the <strong>Commission tab</strong> for more
            information regarding this.
          </p>
        );

      case "username":
        return (
          <p className="text-lg">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Exo
            </span>
            skeleton +{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              Corpse
            </span>{" "}
            ={" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
              Exocorpse
            </span>
          </p>
        );

      case "alias":
        return (
          <p>
            Either{" "}
            <strong className="text-blue-600 dark:text-blue-400">Fenrys</strong>{" "}
            or{" "}
            <strong className="text-purple-600 dark:text-purple-400">
              Morris
            </strong>{" "}
            works, as they represent me as a person, and my branding as a whole.
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950 dark:to-purple-950">
        <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Click on any question to expand the answer
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
          >
            <button
              type="button"
              onClick={() => toggleFaq(faq.id)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
              aria-expanded={expandedFaq === faq.id}
              aria-controls={`faq-panel-${faq.id}`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {faq.question}
              </h3>
              {expandedFaq === faq.id ? (
                <FaChevronUp
                  className="h-4 w-4 flex-shrink-0 text-blue-500 transition-transform"
                  aria-hidden="true"
                />
              ) : (
                <FaChevronDown
                  className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform"
                  aria-hidden="true"
                />
              )}
            </button>
            <section
              id={`faq-panel-${faq.id}`}
              aria-hidden={expandedFaq !== faq.id}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedFaq === faq.id
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                {renderFaqAnswer(faq)}
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
