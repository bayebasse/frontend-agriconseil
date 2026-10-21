import { api } from "./api";
import { createSerializedRequestLoader } from "../utils/serializedRequests";

const loadCalendar = createSerializedRequestLoader((cultureId) => api.calendar(cultureId));

export const calendrierService = {
  getCalendar: (cultureId) => loadCalendar(cultureId),
};