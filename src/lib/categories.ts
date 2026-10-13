export const categories = ["Personal", "Home", "Work", "Wellness", "Learning"] as const;
export type Category = (typeof categories)[number];
export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && categories.some((category) => category === value);
}
