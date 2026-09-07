import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { isValidGrade } from "../src/lib/grades";
import { SUBJECT_META } from "../src/lib/subjects";

export function parsePlatformRequest(body: string) {
  const sections = new Map<string, string>();
  for (const part of body.split(/^### /m).slice(1)) {
    const [heading, ...lines] = part.split("\n");
    sections.set(heading.replace(/^[^\p{L}]+/u, "").trim(), lines.join("\n").trim());
  }
  const field = (name: string) => {
    const value = sections.get(name);
    if (!value || value === "_No response_") throw new Error(`Missing field: ${name}`);
    return value;
  };
  const name = field("Platformnavn");
  const publisher = field("Udgiver");
  const url = field("Platform URL");
  if (!["https:", "http:"].includes(new URL(url).protocol)) throw new Error("URL must use HTTP(S)");
  const subject = field("Fag");
  if (!Object.hasOwn(SUBJECT_META, subject)) throw new Error(`Unknown subject: ${subject}`);
  const selected = sections.get("Klassetrin") ?? sections.get("Vælg klassetrin") ?? "";
  const grades = [...selected.matchAll(/^- \[x\]\s*(?:🎓\s*)?(\d+)\. klasse\s*$/gim)].map((match) =>
    Number(match[1]),
  );
  if (grades.some((grade) => !isValidGrade(grade))) throw new Error("Invalid grade");
  const slug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  const publisherDirectory = slug(publisher);
  const filename = slug(name);
  if (!publisherDirectory || !filename)
    throw new Error("Name and publisher need a nonempty safe filename");
  return {
    path: `src/content/platforms/${publisherDirectory}/${filename}.json`,
    data: {
      name,
      publisher,
      url,
      subject,
      description: field("Kort beskrivelse"),
      longDescription: field("Detaljeret beskrivelse"),
      grades: [...new Set(grades)],
      isActive: true,
      iconOverwrite: false,
      icon: { name: "", color: "" },
    },
  };
}

if (import.meta.main) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error("GITHUB_EVENT_PATH is required");
  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  if (
    event.issue?.user?.login !== "edbpede" ||
    !event.issue.labels.some((label: { name: string }) => label.name === "platform-request")
  ) {
    throw new Error("Only owner platform requests can generate content");
  }
  const request = parsePlatformRequest(event.issue.body ?? "");
  const glob = new Bun.Glob("src/content/platforms/**/*.json");
  for (const file of glob.scanSync(".")) {
    const old = JSON.parse(readFileSync(file, "utf8"));
    if (
      old.name.toLowerCase() === request.data.name.toLowerCase() ||
      old.url.toLowerCase() === request.data.url.toLowerCase()
    ) {
      throw new Error(`Duplicate platform: ${file}`);
    }
  }
  if (existsSync(request.path)) throw new Error(`Refusing to overwrite: ${request.path}`);
  mkdirSync(dirname(request.path), { recursive: true });
  writeFileSync(request.path, `${JSON.stringify(request.data, null, 2)}\n`);
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(process.env.GITHUB_OUTPUT, `path=${request.path}\n`, { flag: "a" });
  }
  console.log(`Created ${request.path}`);
}
