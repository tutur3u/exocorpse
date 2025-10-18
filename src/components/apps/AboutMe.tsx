"use client";

import { useState } from "react";
import {
  FaTumblr,
  FaTwitch,
  FaDiscord,
  FaExternalLinkAlt,
  FaTools,
  FaBriefcase,
  FaInfoCircle,
  FaHeart,
  FaChevronDown,
  FaChevronUp,
  FaPalette,
  FaDesktop,
  FaPencilAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaQuestionCircle,
  FaLink,
  FaYoutube,
} from "react-icons/fa";
import { SiBluesky, SiCanva } from "react-icons/si";
import { IoSparkles } from "react-icons/io5";
import { MdDeveloperMode } from "react-icons/md";

type TabType = "about" | "faq" | "dni" | "socials";

export default function AboutMe() {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What programs / devices do you use?",
      answer: (
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
      ),
    },
    {
      question: "What are your brushes?",
      answer: (
        <div className="space-y-3">
          <div>
            <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">
              CLIP STUDIO PAINT:
            </p>
            <div className="ml-4 space-y-2 text-sm">
              <div>
                <p className="mb-1 font-medium">Inside Clip Studio Assets:</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://assets.clip-studio.com/en-us/detail?id=1762452"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    ggpen <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
                  <a
                    href="https://assets.clip-studio.com/en-us/detail?id=1876673"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    Found Pencil <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
                  <a
                    href="https://assets.clip-studio.com/en-us/detail?id=1764501"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    HibiRough <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    Real G-Pen
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 font-medium">Outside Clip Studio Assets:</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.mediafire.com/file/rk0nh415xvn1e6d/yizhengKE.abr/file"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                  >
                    Yizheng Ke <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
                  <a
                    href="https://pxplus.io/en/product/2850/detail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                  >
                    MINJYE&apos;s Pentagram{" "}
                    <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
                  <a
                    href="https://www.youtube.com/@nekojira425/featured"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                  >
                    Nekojira <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
                  <a
                    href="https://www.postype.com/@q-meng/series/1066317"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                  >
                    QMENG <FaExternalLinkAlt className="h-2 w-2" />
                  </a>
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
      ),
    },
    {
      question: "What are your permissions when it comes to your art?",
      answer: (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
            <p className="mb-2 flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
              <FaCheckCircle /> ALLOWED
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-green-800 dark:text-green-200">
              <li>
                <strong>
                  Profile layouts / video edits / fanfiction, personal printing:
                </strong>{" "}
                All OK!{" "}
                <span className="underline">
                  Make sure it has direct credit to me!
                </span>
              </li>
              <li>
                <strong>Material for learning / studying:</strong> All OK! Make
                sure it has direct credit to me (and tag me too! I&apos;d love
                to see it)
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
                  unless you&apos;re a client that has purchased said rights to
                  an artwork you&apos;ve commissioned from me
                </em>
              </li>
              <li>
                <strong>Edits on artwork, AI and NFT:</strong> Prohibited
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      question: "Where can we find you on social media?",
      answer: (
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
      ),
    },
    {
      question: "Who made your assets?",
      answer: (
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
      ),
    },
    {
      question: "Which artists inspired your artstyle?",
      answer: (
        <div className="flex flex-wrap gap-2">
          {[
            "Ryuki Ryi",
            "Ruintlonewolf",
            "Avogado6",
            "Velinxi",
            "Shigenori Soejima",
            "Zephyo",
          ].map((artist) => (
            <span
              key={artist}
              className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-200"
            >
              {artist}
            </span>
          ))}
        </div>
      ),
    },
    {
      question: "Are your commissions open?",
      answer: (
        <p>
          Please check the <strong>Commission tab</strong> for more information
          regarding this.
        </p>
      ),
    },
    {
      question: "What does your username mean?",
      answer: (
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
      ),
    },
    {
      question: "What alias should we refer to you as?",
      answer: (
        <p>
          Either{" "}
          <strong className="text-blue-600 dark:text-blue-400">Fenrys</strong>{" "}
          or{" "}
          <strong className="text-purple-600 dark:text-purple-400">
            Morris
          </strong>{" "}
          works, as they represent me as a person, and my branding as a whole.
        </p>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        {[
          { id: "about", label: "About", icon: FaUser },
          { id: "faq", label: "FAQ", icon: FaQuestionCircle },
          { id: "dni", label: "DNI", icon: FaInfoCircle },
          { id: "socials", label: "Socials", icon: IoSparkles },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === id
                ? "border-b-2 border-blue-500 bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab(id as TabType)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950 dark:to-purple-950">
              <h2 className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                About Me
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Hi! I&apos;m <strong>Fenrys</strong> (also known as{" "}
                <strong>Morris</strong>), a self-taught artist and writer
                passionate about storytelling and visual art.
              </p>
            </div>

            {/* Important Links */}
            <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <FaLink className="text-indigo-500" />
                Important Links
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="https://dev.exocorpse.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 p-4 transition-all hover:from-cyan-100 hover:to-blue-100 dark:from-cyan-950 dark:to-blue-950 dark:hover:from-cyan-900 dark:hover:to-blue-900"
                >
                  <MdDeveloperMode className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Development Website
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      dev.exocorpse.net
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-3 w-3 text-gray-400 transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-cyan-600 dark:group-hover/link:text-cyan-400" />
                </a>
                <a
                  href="https://www.canva.com/design/DAG1GXjoP_k/RJsNed_ZA8oWHCFMBLHsAA/edit?utm_content=DAG1GXjoP_k&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 transition-all hover:from-purple-100 hover:to-pink-100 dark:from-purple-950 dark:to-pink-950 dark:hover:from-purple-900 dark:hover:to-pink-900"
                >
                  <SiCanva className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Canva Design
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Design resources
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-3 w-3 text-gray-400 transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-purple-600 dark:group-hover/link:text-purple-400" />
                </a>
                <a
                  href="https://www.youtube.com/watch?v=cmq5yUa6e6s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 p-4 transition-all hover:from-red-100 hover:to-orange-100 sm:col-span-2 dark:from-red-950 dark:to-orange-950 dark:hover:from-red-900 dark:hover:to-orange-900"
                >
                  <FaYoutube className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      YouTube Introduction
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Watch my introduction video
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-3 w-3 text-gray-400 transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-red-600 dark:group-hover/link:text-red-400" />
                </a>
              </div>
            </section>

            {/* What I Use */}
            <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <FaTools className="text-blue-500" />
                What I Use
              </h3>
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                    <FaPalette className="text-purple-500" />
                    Programs
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Procreate, Clip Studio Paint, Paint Tool Sai V2
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                    <FaDesktop className="text-green-500" />
                    Tools
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    iPad Pro 12.9 inch 5th Gen, XP-Pen Artist Pro 24 165 Hz 2nd
                    Gen
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                    <FaPencilAlt className="text-orange-500" />
                    Other Stuff
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vegas Pro 17 (video editing), Live2D + After Effects
                    (puppeting)
                  </p>
                </div>
              </div>
            </section>

            {/* Experiences */}
            <section className="group rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <FaBriefcase className="text-green-500" />
                Experiences
              </h3>
              <div className="grid gap-2">
                {[
                  { icon: "🎨", text: "Self-taught artist for 10 years" },
                  { icon: "✍️", text: "Self-taught writer for 4 years" },
                  {
                    icon: "🎮",
                    text: "Undergraduate of RMIT Game Design program",
                  },
                  { icon: "💼", text: "Worked on 400+ commissions on VGen" },
                  {
                    icon: "📚",
                    text: "Worked as a Merch Artist & Page Artist for 2 fanzines",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
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
                <FaInfoCircle className="text-purple-500" />
                More Information
              </h3>
              <div className="grid gap-2">
                {[
                  {
                    icon: "🇻🇳",
                    text: "I'm fully Vietnamese, but more fluent in English",
                  },
                  { icon: "🏳️‍🌈", text: "I'm a queer man (shocker)" },
                  {
                    icon: "🎮",
                    text: "I love story-esque games, bonus points if indie!",
                  },
                  {
                    icon: "💕",
                    text: "I selfship with fictional characters (not surprising)",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
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
                <FaHeart className="text-pink-500" />
                Favorites
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Games",
                    icon: "🎮",
                    color: "blue",
                    items:
                      "Umamusume, Expedition 33, AI: The Somnium Files, Until Dawn, Persona, Minecraft, Overwatch, Phasmophobia",
                  },
                  {
                    label: "Musicians",
                    icon: "🎵",
                    color: "purple",
                    items:
                      "Crywolf, MNQN, Starset, Porter Robinson, Mili, NateWantsToBattle",
                  },
                  {
                    label: "Media",
                    icon: "📺",
                    color: "green",
                    items:
                      "Le Petit Prince, Blade Runner 2049, Arcane, Umamusume: Cinderella Gray, Violet Evergarden, Belle, Look Back",
                  },
                  {
                    label: "Characters",
                    icon: "⭐",
                    color: "pink",
                    items:
                      "Gustave, Maelle; Jayce; Aiba, Mizuki Date; Oguri Cap, Narita Taishin, Narita Brian, Haru Urara; Reaper, Soldier 76, Pharah, Sigma, Moira; Shinjiro Aragaki, Akihiko Sanada, Joker",
                  },
                ].map((fav) => (
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
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
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
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {faq.question}
                    </h3>
                    {expandedFaq === index ? (
                      <FaChevronUp className="h-4 w-4 flex-shrink-0 text-blue-500 transition-transform" />
                    ) : (
                      <FaChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedFaq === index
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DNI Tab */}
        {activeTab === "dni" && (
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
                {[
                  "Anybody under 16",
                  "You hate any of my favorites",
                  "You get mad at my jokes against Americans",
                  "You like Kasumi Yoshizawa (Persona) or Iris Sagan (AITSF)",
                ].map((item, i) => (
                  <div
                    key={i}
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
                {[
                  "Zionist, nazi, racist, republican, homophobic, xenophobic, proship, pedophilic",
                  "Lolicons or shotacons",
                  "Dream team / Wilbur Soot supporter",
                  "Anti-selfship",
                  "You hate Maelle from Expedition 33",
                ].map((item, i) => (
                  <div
                    key={i}
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
        )}

        {/* Socials Tab */}
        {activeTab === "socials" && (
          <div className="space-y-6">
            <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950 dark:to-purple-950">
              <h2 className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                Social Media
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find me on these platforms! All usernames are either{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  exocorpse
                </span>{" "}
                or{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  exocorpsehq
                </span>
                .
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Tumblr */}
              <a
                href="https://exocorpsehq.tumblr.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800">
                    <FaTumblr className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Tumblr
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      exocorpsehq
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
              </a>

              {/* Twitch */}
              <a
                href="https://www.twitch.tv/exocorpsehq"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-purple-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-purple-950" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition-colors group-hover:bg-purple-200 dark:bg-purple-900 dark:group-hover:bg-purple-800">
                    <FaTwitch className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Twitch
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      exocorpsehq
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                </div>
              </a>

              {/* VGen */}
              <a
                href="https://vgen.co/exocorpse"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-pink-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-pink-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-pink-950" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 font-bold text-pink-600 transition-colors group-hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-400 dark:group-hover:bg-pink-800">
                    V
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      VGen
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      exocorpse
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pink-600 dark:group-hover:text-pink-400" />
                </div>
              </a>

              {/* Bluesky */}
              <a
                href="https://bsky.app/profile/exocorpse.bsky.social"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-sky-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-sky-950" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 transition-colors group-hover:bg-sky-200 dark:bg-sky-900 dark:group-hover:bg-sky-800">
                    <SiBluesky className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Bluesky
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @exocorpse.bsky.social
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                </div>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/exocorpse"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-400 hover:shadow-lg md:col-span-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-indigo-950" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-900 dark:group-hover:bg-indigo-800">
                    <FaDiscord className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Discord Server
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      discord.gg/exocorpse
                    </p>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
