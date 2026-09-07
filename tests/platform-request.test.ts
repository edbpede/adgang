import { expect, test } from "bun:test";
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
