import assert from "node:assert/strict";
import {
  clearFarmerMessagingAccess,
  grantFarmerMessagingAccess,
  hasFarmerMessagingAccess,
} from "../src/utils/farmerMessagingAccess.js";

const values = new Map();
globalThis.localStorage = {
  getItem(key) {
    return values.get(key) ?? null;
  },
  setItem(key, value) {
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  },
};

const farmer = { id: 42, role: "farmer" };
const anotherFarmer = { id: 43, role: "farmer" };

assert.equal(hasFarmerMessagingAccess(farmer), false, "access starts locked");
grantFarmerMessagingAccess(farmer);
assert.equal(hasFarmerMessagingAccess(farmer), true, "simulated payment persists for this farmer");
assert.equal(hasFarmerMessagingAccess(anotherFarmer), false, "access is isolated per farmer account");
clearFarmerMessagingAccess(farmer);
assert.equal(hasFarmerMessagingAccess(farmer), false, "logging out resets access for the next login");
grantFarmerMessagingAccess(farmer);
assert.equal(hasFarmerMessagingAccess(farmer), true, "the farmer can simulate payment again after logging in");
assert.throws(
  () => grantFarmerMessagingAccess({ role: "farmer" }),
  /identifier votre compte/,
  "payment cannot be recorded without an account identifier"
);

process.stdout.write("✓ farmer messaging access is saved per account\n");
