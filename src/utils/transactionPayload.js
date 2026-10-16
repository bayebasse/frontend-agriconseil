export function buildTransactionPayload(mode, { quantity, date, message, reservationType }) {
  const common = { quantite_kg: quantity, message };
  if (mode === "order") return { ...common, date_souhaitee: date };
  return {
    ...common,
    date_disponibilite_souhaitee: date,
    type_reservation: reservationType,
  };
}
