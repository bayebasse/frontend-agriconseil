const cropImageFiles = {
  arachide: "arachide.jpg",
  mais: "mais.jpg",
  mangue: "mangue.jpg",
  manioc: "manioc.jpg",
  mil: "mil.jpg",
  niebe: "niebe.jpg",
  oignon: "oignon.jpg",
  pasteque: "pasteque.jpg",
  riz: "riz.jpg",
  sorgho: "sorgho.jpg",
};

export function getCropImageUrl(cropName) {
  if (!cropName || typeof cropName !== "string") return null;

  const normalizedName = cropName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const imageFile = cropImageFiles[normalizedName];

  return imageFile ? `/images/cultures/${imageFile}` : null;
}
