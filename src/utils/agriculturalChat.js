const STATUS_LABELS = {
  answered: "Réponse appuyée par des sources",
  refused: "Question hors périmètre agricole",
  clarification: "Précision nécessaire",
  insufficient_evidence: "Source vérifiée insuffisante",
};

export function getAgriculturalChatPresentation(result) {
  return {
    label: STATUS_LABELS[result?.status] || "Réponse de l’assistant",
    isGrounded: result?.status === "answered",
    sources: Array.isArray(result?.sources) ? result.sources : [],
  };
}
