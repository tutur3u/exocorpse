"use client";

import {
  groupAboutItemsBySection,
  mapAboutFaqsByType,
  type AboutFaq,
  type AboutPageData,
} from "@/lib/about";
import { useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaTimesCircle,
} from "react-icons/fa";

const USERNAME_TEMPLATE_PATTERN =
  /(\{\{left\}\}|\{\{right\}\}|\{\{result\}\})/g;

function renderUsernameTemplate(faq: AboutFaq) {
  const template =
    faq.username_template?.trim() || "{{left}} + {{right}} = {{result}}";

  return template
    .split(USERNAME_TEMPLATE_PATTERN)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      if (part === "{{left}}") {
        return (
          <span
            key={`${part}-${index}`}
            className="font-semibold text-cyan-300"
          >
            {faq.username_prefix_left}
          </span>
        );
      }

      if (part === "{{right}}") {
        return (
          <span
            key={`${part}-${index}`}
            className="font-semibold text-fuchsia-300"
          >
            {faq.username_prefix_right}
          </span>
        );
      }

      if (part === "{{result}}") {
        return (
          <span
            key={`${part}-${index}`}
            className="bg-linear-to-r from-cyan-300 to-fuchsia-300 bg-clip-text font-bold text-transparent"
          >
            {faq.username_result}
          </span>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
}

export default function FaqTab({ data }: { data: AboutPageData }) {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const itemsBySection = groupAboutItemsBySection(data.items);
  const faqByType = mapAboutFaqsByType(data.faqs);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const renderFaqAnswer = (faq: AboutFaq) => {
    switch (faq.faq_type) {
      case "programs":
        return (
          <div className="space-y-2">
            <p>
              <strong>PROGRAMS:</strong>{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-slate-100">
                {faq.programs_text}
              </code>
            </p>
            <p>
              <strong>DEVICES:</strong>{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-slate-100">
                {faq.devices_text}
              </code>
            </p>
            <p>
              <strong>OTHER STUFF:</strong>
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              {itemsBySection.faq_program_other.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}:</strong>{" "}
                  <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-slate-100">
                    {item.body}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        );

      case "brushes":
        return (
          <div className="space-y-3">
            <div>
              <p className="mb-2 font-medium text-slate-100">
                CLIP STUDIO PAINT:
              </p>
              <div className="ml-4 space-y-2 text-sm">
                <div>
                  <p className="mb-1 font-medium">Inside Clip Studio Assets:</p>
                  <div className="flex flex-wrap gap-2">
                    {itemsBySection.faq_brush_inside.map((brush) =>
                      brush.url ? (
                        <a
                          key={brush.id}
                          href={brush.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-cyan-950/80 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-900"
                        >
                          {brush.title}{" "}
                          <FaExternalLinkAlt className="h-2 w-2" />
                        </a>
                      ) : (
                        <span
                          key={brush.id}
                          className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200"
                        >
                          {brush.title}
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
                    {itemsBySection.faq_brush_outside.map((brush) => (
                      <a
                        key={brush.id}
                        href={brush.url ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-fuchsia-950/75 px-2 py-1 text-xs text-fuchsia-200 hover:bg-fuchsia-900"
                      >
                        {brush.title} <FaExternalLinkAlt className="h-2 w-2" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-1 font-medium text-slate-100">PROCREATE:</p>
              <p className="ml-4 text-sm">{faq.brushes_procreate_text}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-slate-100">PAINT TOOL SAI:</p>
              <p className="ml-4 text-sm">{faq.brushes_paint_tool_sai_text}</p>
            </div>
          </div>
        );

      case "permissions":
        return (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-950/55 p-3">
              <p className="mb-2 flex items-center gap-2 font-semibold text-emerald-200">
                <FaCheckCircle /> ALLOWED
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-emerald-100/88">
                {itemsBySection.faq_permission_allowed.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}:</strong> {item.body}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-red-400/25 bg-red-950/55 p-3">
              <p className="mb-2 flex items-center gap-2 font-semibold text-red-200">
                <FaTimesCircle /> PROHIBITED
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-red-100/88">
                {itemsBySection.faq_permission_prohibited.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}:</strong> {item.body}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-2">
            <p>{faq.social_intro_text}</p>
            <blockquote className="border-l-4 border-cyan-400 bg-cyan-950/45 py-2 pl-4 text-sm text-slate-100 italic">
              {faq.social_note_prefix}{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-100 not-italic">
                {faq.social_display_name}
              </code>{" "}
              {faq.social_note_suffix}
            </blockquote>
          </div>
        );

      case "assets":
        return (
          <div className="space-y-2">
            {itemsBySection.faq_asset_credit.map((item) => (
              <p key={item.id}>
                <strong>{item.title}:</strong>{" "}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    {item.subtitle || item.body}{" "}
                    <FaExternalLinkAlt className="h-3 w-3" />
                  </a>
                ) : (
                  <span>{item.subtitle || item.body}</span>
                )}
              </p>
            ))}
          </div>
        );

      case "artists":
        return (
          <div className="flex flex-wrap gap-2">
            {itemsBySection.faq_artist.map((artist) => (
              <span
                key={artist.id}
                className="rounded-full bg-fuchsia-950/70 px-3 py-1 text-sm text-fuchsia-200"
              >
                {artist.title}
              </span>
            ))}
          </div>
        );

      case "commissions":
        return <p>{faq.commissions_text}</p>;

      case "username":
        return (
          <p className="text-lg whitespace-pre-wrap">
            {renderUsernameTemplate(faq)}
          </p>
        );

      case "alias":
        return (
          <p>
            Either{" "}
            <strong className="text-cyan-300">{faq.alias_primary}</strong> or{" "}
            <strong className="text-fuchsia-300">{faq.alias_secondary}</strong>{" "}
            {faq.alias_description}
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 rounded-xl border border-cyan-400/18 bg-linear-to-br from-cyan-950/60 to-fuchsia-950/45 p-6">
        <h2 className="bg-linear-to-r from-cyan-200 to-fuchsia-300 bg-clip-text text-3xl font-bold text-transparent">
          {data.settings.faq_title}
        </h2>
        <p className="mt-2 text-sm text-slate-300">{data.settings.faq_intro}</p>
      </div>

      <div className="space-y-3">
        {data.faqs.map((faq) => {
          const stableFaq = faqByType[faq.faq_type as keyof typeof faqByType];

          if (!stableFaq) {
            return null;
          }

          return (
            <div
              key={stableFaq.id}
              className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 shadow-sm transition-all hover:border-cyan-400/38 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleFaq(stableFaq.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-800"
                aria-expanded={expandedFaq === stableFaq.id}
                aria-controls={`faq-panel-${stableFaq.id}`}
              >
                <h3 className="font-semibold text-slate-100">
                  {stableFaq.question}
                </h3>
                {expandedFaq === stableFaq.id ? (
                  <FaChevronUp
                    className="h-4 w-4 flex-shrink-0 text-cyan-300 transition-transform"
                    aria-hidden="true"
                  />
                ) : (
                  <FaChevronDown
                    className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform"
                    aria-hidden="true"
                  />
                )}
              </button>
              <section
                id={`faq-panel-${stableFaq.id}`}
                aria-hidden={expandedFaq !== stableFaq.id}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedFaq === stableFaq.id
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="border-t border-slate-700/80 bg-slate-950/80 p-4 text-sm text-slate-300">
                  {renderFaqAnswer(stableFaq)}
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
