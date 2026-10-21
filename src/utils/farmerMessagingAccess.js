function storageKey(user) {
  const identifier = user?.id ?? user?.email ?? user?.username;
  return identifier == null
    ? null
    : `agri_farmer_messaging_access_v1_${encodeURIComponent(String(identifier))}`;
}

export function hasFarmerMessagingAccess(user) {
  const key = storageKey(user);
  return Boolean(key && localStorage.getItem(key) === "paid");
}

export function grantFarmerMessagingAccess(user) {
  const key = storageKey(user);
  if (!key) {
    throw new Error("Impossible d’identifier votre compte pour enregistrer l’accès.");
  }
  localStorage.setItem(key, "paid");
}

export function clearFarmerMessagingAccess(user) {
  const key = storageKey(user);
  if (key) localStorage.removeItem(key);
}
