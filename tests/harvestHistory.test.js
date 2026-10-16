import assert from "node:assert/strict";
import { getPastHarvestDate } from "../src/utils/harvestHistory.js";

const today = new Date(2026, 9, 16, 12);

assert.equal(
  getPastHarvestDate({ date_recolte_fin: "2026-10-15" }, today),
  "2026-10-15",
  "a harvest ending before today is historical"
);
assert.equal(
  getPastHarvestDate({ date_recolte_fin: "2026-10-16" }, today),
  null,
  "a harvest ending today is not historical yet"
);
assert.equal(
  getPastHarvestDate({ date_recolte_fin: "2026-10-20" }, today),
  null,
  "a future harvest is not historical"
);
assert.equal(
  getPastHarvestDate({ date_recolte_debut: "2026-10-10", date_recolte_fin: "2026-10-20" }, today),
  null,
  "a harvest period is historical only after its end date"
);
assert.equal(
  getPastHarvestDate({ date_recolte_debut: "2026-10-10" }, today),
  "2026-10-10",
  "a single past harvest date is historical"
);
assert.equal(
  getPastHarvestDate({ date_recolte_fin: "2026-02-30" }, today),
  null,
  "an invalid calendar date is ignored"
);
assert.equal(
  getPastHarvestDate({}, today),
  null,
  "a culture without a harvest date is not historical"
);

process.stdout.write("✓ harvest history includes only past harvest dates\n");
