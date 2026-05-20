/**
 * Allowed scenario levels (stored in MongoDB on Scenario.level).
 * Use `id` in API/DB; show `label` in UI badges and forms.
 */
export const SCENARIO_LEVELS = [
  { id: "1", label: "Level 1" },
  { id: "2", label: "Level 2" },
  { id: "3", label: "Level 3" },
] as const;
//ScenarioLevel is a TypeScript union type ("1" | "2" | "3") automatically derived from SCENARIO_LEVELS.
export type ScenarioLevel = (typeof SCENARIO_LEVELS)[number]["id"];

/** For Mongoose `enum` on Scenario schema. */
export const SCENARIO_LEVEL_IDS: ScenarioLevel[] = SCENARIO_LEVELS.map((l) => l.id);

export function isScenarioLevel(value: string): value is ScenarioLevel {
  return SCENARIO_LEVELS.some((l) => l.id === value);
}

export function scenarioLevelLabel(id: ScenarioLevel): string {
  const level = SCENARIO_LEVELS.find((l) => l.id === id);
  return level?.label ?? id;
}
