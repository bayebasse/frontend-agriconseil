import assert from "node:assert/strict";
import { isValidPersonName, isValidSenegalPhone } from "../src/utils/accountValidation.js";

for (const name of ["Mamadou", "Ndiaye Diop", "Jean-Pierre", "Aïssatou", "O’Neil"]) {
  assert.equal(isValidPersonName(name), true, name);
}

for (const name of ["", "Mamadou7", "Awa_Diop", "Jean--Pierre"]) {
  assert.equal(isValidPersonName(name), false, name);
}

for (const phone of ["761234567", "77 123 45 67", "78-123-45-67", "+221 76 123 45 67"]) {
  assert.equal(isValidSenegalPhone(phone), true, phone);
}

for (const phone of ["701234567", "751234567", "791234567", "77abc4567", "77123456", "+221 77 123 45 678"]) {
  assert.equal(isValidSenegalPhone(phone), false, phone);
}

process.stdout.write("✓ names and Senegal phone numbers are validated\n");
