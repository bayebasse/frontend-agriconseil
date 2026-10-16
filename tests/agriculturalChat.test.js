import assert from "node:assert/strict";
import { getAgriculturalChatPresentation } from "../src/utils/agriculturalChat.js";

const source = { title: "Guide FAO", url: "https://www.fao.org/example" };
const answered = getAgriculturalChatPresentation({ status: "answered", sources: [source] });
assert.equal(answered.isGrounded, true);
assert.equal(answered.sources[0].title, "Guide FAO");
assert.match(answered.label, /sources/);

for (const status of ["refused", "clarification", "insufficient_evidence"]) {
  const presentation = getAgriculturalChatPresentation({ status, sources: [] });
  assert.equal(presentation.isGrounded, false, status);
  assert.equal(presentation.sources.length, 0, status);
  assert.notEqual(presentation.label, "Réponse appuyée par des sources", status);
}

process.stdout.write("✓ chat distinguishes grounded, refused, clarification, and no-source results\n");
