import assert from "node:assert/strict";
import { createSerializedRequestLoader } from "../src/utils/serializedRequests.js";

let activeRequests = 0;
let maximumActiveRequests = 0;
const startedRequests = [];
const loadRequest = createSerializedRequestLoader(async (key) => {
  activeRequests += 1;
  maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
  startedRequests.push(key);
  await new Promise((resolve) => setTimeout(resolve, 5));
  activeRequests -= 1;
  if (key === "failure") throw new Error("Expected test failure");
  return key;
});

const firstRequest = loadRequest("culture-1");
const duplicateRequest = loadRequest("culture-1");
const secondRequest = loadRequest("culture-4");

assert.equal(firstRequest, duplicateRequest, "concurrent calls for one crop share a request");
assert.deepEqual(await Promise.all([firstRequest, duplicateRequest, secondRequest]), [
  "culture-1",
  "culture-1",
  "culture-4",
]);
assert.equal(maximumActiveRequests, 1, "calendar requests are serialized");
assert.deepEqual(startedRequests, ["culture-1", "culture-4"]);

await assert.rejects(loadRequest("failure"), /Expected test failure/);
assert.equal(await loadRequest("culture-5"), "culture-5", "a failed call does not block the queue");

process.stdout.write("✓ calendar requests are deduplicated and serialized\n");
