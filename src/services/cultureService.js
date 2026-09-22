import { api } from "./api";

export const cultureService = {
  getCultures: () => api.cultures(),

  getRegions: () => api.regions(),

  getCultureReferences: () => api.cultureRefs(),

  getDepartments: (regionId) => api.departments(regionId),

  getCommunes: (departmentId) => api.communes(departmentId),

  createCulture: (data) => api.createCulture(data),
};