function toLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getPastHarvestDate(culture, today = new Date()) {
  const harvestDate =
    culture?.date_recolte_fin ||
    culture?.recolte_prevue?.date_fin ||
    culture?.date_recolte ||
    culture?.date_recolte_debut ||
    culture?.recolte_prevue?.date_debut;

  if (typeof harvestDate !== "string") {
    return null;
  }

  const dateKey = harvestDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }

  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime()) || toLocalDateKey(date) !== dateKey) {
    return null;
  }

  return dateKey < toLocalDateKey(today) ? dateKey : null;
}
