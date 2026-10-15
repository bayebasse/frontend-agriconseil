import assert from "node:assert/strict";
import { getMarketAction } from "../src/utils/marketActions.js";
import { buildTransactionPayload } from "../src/utils/transactionPayload.js";

const cases = [
  ["positive actual stock enables an order", { statut_recolte: "available", recolte_disponible_kg: "2.5" }, "order"],
  ["in-progress harvest enables reservation", { statut_recolte: "in_progress", recolte_disponible_kg: null }, "reservation"],
  ["zero stock disables actions", { statut_recolte: "available", recolte_disponible_kg: "0" }, "unavailable"],
  ["exhausted harvest disables actions", { statut_recolte: "exhausted", recolte_disponible_kg: "12" }, "unavailable"],
  ["cancelled harvest disables actions", { statut_recolte: "cancelled" }, "unavailable"],
  ["unavailable harvest disables actions", { statut_recolte: "unavailable" }, "unavailable"],
];

for (const [name, crop, expected] of cases) {
  assert.equal(getMarketAction(crop), expected, name);
  process.stdout.write(`✓ ${name}\n`);
}

const orderPayload = buildTransactionPayload("order", {
  quantity: "3", date: "2026-10-20", message: "Livrer le matin", reservationType: "firm",
});
assert.deepEqual(orderPayload, {
  quantite_kg: "3", date_souhaitee: "2026-10-20", message: "Livrer le matin",
});
const reservationPayload = buildTransactionPayload("reservation", {
  quantity: "6", date: "2026-11-02", message: "", reservationType: "indicative",
});
assert.deepEqual(reservationPayload, {
  quantite_kg: "6", date_disponibilite_souhaitee: "2026-11-02", message: "", type_reservation: "indicative",
});
process.stdout.write("✓ order and reservation forms submit distinct fields\n");
