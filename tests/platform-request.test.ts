import { expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parsePlatformRequest } from "../scripts/platform-request";

const form = `### 📚 Platformnavn

Example's school $(touch unwanted)

### 🏢 Udgiver

Publisher

### 🔗 Platform URL

https://example.invalid/learn

### 📖 Fag

dansk

### 🎓 Klassetrin

- [x] 🎓 0. klasse
- [ ] 🎓 1. klasse
- [x] 🎓 3. klasse

### 📝 Kort beskrivelse

A short description.

### 📋 Detaljeret beskrivelse

First paragraph.

Second paragraph with 'quotes' and $literal.
`;

test("real form headings preserve checked grades and multiline descriptions", () => {
  const request = parsePlatformRequest(form);
  expect(request.data.grades).toEqual([0, 3]);
  expect(request.data.longDescription).toContain("\n\nSecond paragraph");
  expect(request.data.name).toContain("$(touch unwanted)");
  expect(request.path).toBe("src/content/platforms/publisher/example-s-school-touch-unwanted.json");
});
test("unchecked grades remain the other-platforms bucket", () => {
  expect(parsePlatformRequest(form.replaceAll("[x]", "[ ]")).data.grades).toEqual([]);
});
test("unknown subjects and out-of-range grades are rejected", () => {
  expect(() => parsePlatformRequest(form.replace("\ndansk\n", "\nfransk\n"))).toThrow(
    "Unknown subject",
  );
  expect(() => parsePlatformRequest(form.replace("3. klasse", "30. klasse"))).toThrow(
    "Invalid grade",
  );
});
test("missing fields and unsafe URL protocols are rejected", () => {
  expect(() => parsePlatformRequest(form.replace("Publisher", "_No response_"))).toThrow(
    "Missing field",
  );
  expect(() =>
    parsePlatformRequest(form.replace("https://example.invalid/learn", "javascript:alert(1)")),
  ).toThrow("HTTP(S)");
});
test("empty normalized publisher names cannot write outside the catalog", () => {
  expect(() => parsePlatformRequest(form.replace("Publisher", "../.."))).toThrow("safe filename");
});

test("the writer accepts only labeled requests from edbfi", () => {
  const script = new URL("../scripts/platform-request.ts", import.meta.url).pathname;
  for (const [login, labeled, accepted] of [
    ["edbfi", true, true],
    ["edbpede", true, false],
    ["another-user", true, false],
    ["edbfi", false, false],
  ] as const) {
    const directory = mkdtempSync(join(tmpdir(), "platform-request-"));
    try {
      const eventPath = join(directory, "event.json");
      writeFileSync(
        eventPath,
        JSON.stringify({
          issue: {
            user: { login },
            labels: labeled ? [{ name: "platform-request" }] : [],
            body: form,
          },
        }),
      );
      const result = Bun.spawnSync([process.execPath, "run", script], {
        cwd: directory,
        env: {
          ...process.env,
          GITHUB_EVENT_PATH: eventPath,
          GITHUB_OUTPUT: join(directory, "output"),
        },
      });
      expect(result.exitCode === 0).toBe(accepted);
      expect(existsSync(join(directory, parsePlatformRequest(form).path))).toBe(accepted);
      if (!accepted) expect(result.stderr.toString()).toContain("Only owner platform requests");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
});
