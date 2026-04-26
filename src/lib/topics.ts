/**
 * Single source of truth for:
 * - the horizontal topic strip on the student dashboard (later)
 * - topic tags when teachers create scenarios (later)
 *
 * Rules:
 * - Store `id` in the database and API queries (stable, no spaces).
 * - Show `label` to users in the UI.
 */
export const TOPICS = [
  { id: "daily_life", label: "Daily life" },
  { id: "health", label: "Health" },
  { id: "travel", label: "Travel" },
  { id: "family_community", label: "Family & community" },
  { id: "entertainment", label: "Entertainment & media" },
  { id: "work_career", label: "Work & career" },
  { id: "celebration", label: "Celebration & food" },
  { id: "nature", label: "Environment & nature" },
  { id: "current_events", label: "Current & community issues" },
] as const;

/** Union of all topic ids, e.g. "travel" | "health" | ... */
export type TopicId = (typeof TOPICS)[number]["id"];

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((t) => t.id === value);
}

export function topicLabel(id: TopicId): string {
  const t = TOPICS.find((x) => x.id === id);
  return t?.label ?? id;
}
