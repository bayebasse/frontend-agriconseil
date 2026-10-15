import { api } from "./api";

export const iaService = {
  analyze: (formData) => api.analyze(formData),
  askAgriculturalQuestion: (question) => api.agriculturalChat({ question }),
};
