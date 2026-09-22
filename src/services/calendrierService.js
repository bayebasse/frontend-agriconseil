import { api } from "./api";

export const calendrierService = {
  getCalendar: (cultureId) => api.calendar(cultureId),
};