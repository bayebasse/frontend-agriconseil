import { api } from "./api";

export const meteoService = {
  getWeather: (cultureId) => api.weather(cultureId),
};