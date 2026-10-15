export function getMarketAction(crop) {
  if (crop?.statut_recolte === "available" && Number(crop.recolte_disponible_kg) > 0) {
    return "order";
  }
  if (crop?.statut_recolte === "in_progress") return "reservation";
  return "unavailable";
}
