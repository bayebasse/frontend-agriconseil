import { api } from "./api";

export const hydriqueService = {
  getHydrique: (cultureId) => api.hydrique(cultureId),
};