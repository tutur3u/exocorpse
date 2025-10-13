import ColorPicker from "@/components/shared/ColorPicker";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import type { Character } from "@/lib/actions/wiki";
import { useState } from "react";

type CharacterFormProps = {
  character?: Character;
  worldId: string;
  onSubmit: (data: {
    world_id: string;
    name: string;
    slug: string;
    nickname?: string;
    title?: string;
    age?: number;
    age_description?: string;
    species?: string;
    gender?: string;
    pronouns?: string;
    height?: string;
    weight?: string;
    build?: string;
    hair_color?: string;
    eye_color?: string;
    skin_tone?: string;
    distinguishing_features?: string;
    status?: "alive" | "deceased" | "unknown" | "missing" | "imprisoned";
    occupation?: string;
    personality_summary?: string;
    likes?: string;
    dislikes?: string;
    fears?: string;
    goals?: string;
    backstory?: string;
    lore?: string;
    skills?: string;
    abilities?: string;
    strengths?: string;
    weaknesses?: string;
    profile_image?: string;
    banner_image?: string;
    color_scheme?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function CharacterForm({
  character,
  worldId,
  onSubmit,
  onCancel,
}: CharacterFormProps) {
  const [activeTab, setActiveTab] = useState<
    "basic" | "physical" | "personality" | "history" | "abilities" | "visuals"
  >("basic");

  // Basic Info & Demographics
  const [name, setName] = useState(character?.name || "");
  const [slug, setSlug] = useState(character?.slug || "");
  const [nickname, setNickname] = useState(character?.nickname || "");
  const [title, setTitle] = useState(character?.title || "");
  const [age, setAge] = useState(character?.age?.toString() || "");
  const [ageDescription, setAgeDescription] = useState(
    character?.age_description || "",
  );
  const [species, setSpecies] = useState(character?.species || "");
  const [gender, setGender] = useState(character?.gender || "");
  const [pronouns, setPronouns] = useState(character?.pronouns || "");
  const [status, setStatus] = useState<
    "alive" | "deceased" | "unknown" | "missing" | "imprisoned"
  >(
    (character?.status as
      | "alive"
      | "deceased"
      | "unknown"
      | "missing"
      | "imprisoned") || "alive",
  );
  const [occupation, setOccupation] = useState(character?.occupation || "");

  // Physical
  const [height, setHeight] = useState(character?.height || "");
  const [weight, setWeight] = useState(character?.weight || "");
  const [build, setBuild] = useState(character?.build || "");
  const [hairColor, setHairColor] = useState(character?.hair_color || "");
  const [eyeColor, setEyeColor] = useState(character?.eye_color || "");
  const [skinTone, setSkinTone] = useState(character?.skin_tone || "");
  const [distinguishingFeatures, setDistinguishingFeatures] = useState(
    character?.distinguishing_features || "",
  );

  // Personality
  const [personalitySummary, setPersonalitySummary] = useState(
    character?.personality_summary || "",
  );
  const [likes, setLikes] = useState(character?.likes || "");
  const [dislikes, setDislikes] = useState(character?.dislikes || "");
  const [fears, setFears] = useState(character?.fears || "");
  const [goals, setGoals] = useState(character?.goals || "");

  // History
  const [backstory, setBackstory] = useState(character?.backstory || "");
  const [lore, setLore] = useState(character?.lore || "");

  // Abilities
  const [skills, setSkills] = useState(character?.skills || "");
  const [abilities, setAbilities] = useState(character?.abilities || "");
  const [strengths, setStrengths] = useState(character?.strengths || "");
  const [weaknesses, setWeaknesses] = useState(character?.weaknesses || "");

  // Visuals
  const [profileImage, setProfileImage] = useState(
    character?.profile_image || "",
  );
  const [bannerImage, setBannerImage] = useState(character?.banner_image || "");
  const [colorScheme, setColorScheme] = useState(
    character?.color_scheme || "#3b82f6",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        world_id: worldId,
        name,
        slug,
        nickname: nickname || undefined,
        title: title || undefined,
        age: age ? parseInt(age) : undefined,
        age_description: ageDescription || undefined,
        species: species || undefined,
        gender: gender || undefined,
        pronouns: pronouns || undefined,
        height: height || undefined,
        weight: weight || undefined,
        build: build || undefined,
        hair_color: hairColor || undefined,
        eye_color: eyeColor || undefined,
        skin_tone: skinTone || undefined,
        distinguishing_features: distinguishingFeatures || undefined,
        status: status || undefined,
        occupation: occupation || undefined,
        personality_summary: personalitySummary || undefined,
        likes: likes || undefined,
        dislikes: dislikes || undefined,
        fears: fears || undefined,
        goals: goals || undefined,
        backstory: backstory || undefined,
        lore: lore || undefined,
        skills: skills || undefined,
        abilities: abilities || undefined,
        strengths: strengths || undefined,
        weaknesses: weaknesses || undefined,
        profile_image: profileImage || undefined,
        banner_image: bannerImage || undefined,
        color_scheme: colorScheme || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!character) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  return (
    <div
      className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      onClick={onCancel}
    >
      <div
        className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold">
            {character ? "Edit Character" : "Create New Character"}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-300 px-6 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "basic"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("physical")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "physical"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Physical
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personality")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "personality"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Personality
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            History & Lore
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("abilities")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "abilities"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Abilities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("visuals")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "visuals"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Visuals
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Johnny"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="john-doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Dr., Agent, Commander, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="28"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Age Description
                    </label>
                    <input
                      type="text"
                      value={ageDescription}
                      onChange={(e) => setAgeDescription(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="early 20s, ancient, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Species
                    </label>
                    <input
                      type="text"
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Human, Elf, etc."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Male, Female, Non-binary, etc."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="he/him, she/her, they/them"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as typeof status)
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="alive">Alive</option>
                      <option value="deceased">Deceased</option>
                      <option value="unknown">Unknown</option>
                      <option value="missing">Missing</option>
                      <option value="imprisoned">Imprisoned</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Mercenary, Scholar, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Physical Tab */}
            {activeTab === "physical" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Height
                    </label>
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="6'2&quot;, 185 cm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="180 lbs, 80 kg"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Build
                    </label>
                    <input
                      type="text"
                      value={build}
                      onChange={(e) => setBuild(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Athletic, Slender, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Hair Color
                    </label>
                    <input
                      type="text"
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Black, Blonde, etc."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Eye Color
                    </label>
                    <input
                      type="text"
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Brown, Blue, etc."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Skin Tone
                    </label>
                    <input
                      type="text"
                      value={skinTone}
                      onChange={(e) => setSkinTone(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Fair, Tan, Dark, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Distinguishing Features
                  </label>
                  <textarea
                    value={distinguishingFeatures}
                    onChange={(e) => setDistinguishingFeatures(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Scars, tattoos, cybernetic implants, glowing eyes, etc..."
                  />
                </div>
              </div>
            )}

            {/* Personality Tab */}
            {activeTab === "personality" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Personality Summary
                  </label>
                  <textarea
                    value={personalitySummary}
                    onChange={(e) => setPersonalitySummary(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="A brief description of their personality..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Likes
                  </label>
                  <textarea
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="What they enjoy or appreciate..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Dislikes
                  </label>
                  <textarea
                    value={dislikes}
                    onChange={(e) => setDislikes(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="What they dislike or avoid..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Fears
                  </label>
                  <textarea
                    value={fears}
                    onChange={(e) => setFears(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Their deepest fears..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Goals
                  </label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="What they're trying to achieve..."
                  />
                </div>
              </div>
            )}

            {/* History & Lore Tab */}
            {activeTab === "history" && (
              <div className="space-y-4">
                <MarkdownEditor
                  label="Backstory"
                  value={backstory}
                  onChange={setBackstory}
                  placeholder="# Backstory\n\nDescribe their personal history, how they came to be who they are..."
                  helpText="Character's personal history and background. Supports markdown."
                  rows={12}
                />

                <MarkdownEditor
                  label="Additional Lore"
                  value={lore}
                  onChange={setLore}
                  placeholder="# Additional Lore\n\nAny extra world-building details, connections to other characters or events..."
                  helpText="Extra lore and world-building details. Supports markdown."
                  rows={8}
                />
              </div>
            )}

            {/* Abilities Tab */}
            {activeTab === "abilities" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Skills
                  </label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Combat, hacking, piloting, etc..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Abilities
                  </label>
                  <textarea
                    value={abilities}
                    onChange={(e) => setAbilities(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Special powers, magic, superhuman traits..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Strengths
                  </label>
                  <textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="What they excel at..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Weaknesses
                  </label>
                  <textarea
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Their vulnerabilities and limitations..."
                  />
                </div>
              </div>
            )}

            {/* Visuals Tab */}
            {activeTab === "visuals" && (
              <div className="space-y-4">
                <ImageUploader
                  label="Profile Image"
                  value={profileImage}
                  onChange={setProfileImage}
                  helpText="Main character portrait"
                />

                <ImageUploader
                  label="Banner Image"
                  value={bannerImage}
                  onChange={setBannerImage}
                  helpText="Banner image for character page"
                />

                <ColorPicker
                  label="Color Scheme"
                  value={colorScheme}
                  onChange={setColorScheme}
                  helpText="Theme color for this character"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-300 px-6 py-4 dark:border-gray-600">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : character
                  ? "Update Character"
                  : "Create Character"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
