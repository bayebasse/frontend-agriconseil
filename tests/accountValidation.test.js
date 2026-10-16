import assert from "node:assert/strict";
import { isValidSenegalPhone, usernameContainsDigits } from "../src/utils/accountValidation.js";

assert.equal(usernameContainsDigits("Mamadou"), false);
assert.equal(usernameContainsDigits("mamadou.diallo"), false);
assert.equal(usernameContainsDigits("mamadou7"), true);

for (const phone of ["761234567", "77 123 45 67", "78-123-45-67", "+221 76 123 45 67"]) {
  assert.equal(isValidSenegalPhone(phone), true, phone);
}

for (const phone of ["701234567", "751234567", "791234567", "77abc4567", "77123456", "+221 77 123 45 678"]) {
  assert.equal(isValidSenegalPhone(phone), false, phone);
}

process.stdout.write("✓ usernames exclude digits and Senegal phone numbers are validated\n");
