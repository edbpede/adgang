import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { GRADES, isValidGrade, phaseOf } from "../src/lib/grades";
import { SUBJECT_META, subjectMeta } from "../src/lib/subjects";

test("school phases cover each grade once and reject invalid grades", () => {
  expect(GRADES).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const grade of GRADES) expect(isValidGrade(grade)).toBe(true);
  for (const grade of [-1, 10, 1.5, Number.NaN]) expect(isValidGrade(grade)).toBe(false);
  expect(phaseOf(3)?.id).toBe("indskoling");
  expect(phaseOf(4)?.id).toBe("mellemtrin");
  expect(phaseOf(7)?.id).toBe("udskoling");
  expect(subjectMeta("missing")).toEqual(SUBJECT_META.andre);
});
test("subject data, schema, presentation and issue dropdown use the same keys", () => {
  const subjects = [...new Bun.Glob("src/content/subjects/*.json").scanSync(".")]
    .map((file) => JSON.parse(readFileSync(file, "utf8")).name)
    .sort();
  expect(Object.keys(SUBJECT_META).sort()).toEqual(subjects);
  const schema = readFileSync("src/content.config.ts", "utf8").match(
    /const subjectSlugs = \[([\s\S]*?)\] as const/,
  );
  expect(schema).not.toBeNull();
  const keys = [...(schema?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort();
  expect(keys).toEqual(subjects);
  const form = Bun.YAML.parse(readFileSync(".github/ISSUE_TEMPLATE/new-platform.yml", "utf8")) as {
    body: { id?: string; attributes?: { options?: string[] } }[];
  };
  expect(form.body.find((field) => field.id === "subject")?.attributes?.options?.sort()).toEqual(
    subjects,
  );
});
