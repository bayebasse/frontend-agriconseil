import { api } from "./api";

export const adminService = {
  getFarmers: () =>
    api.adminFarmers(),

  createFarmer: (data) =>
    api.adminCreateFarmer(data),

  updateFarmer: (id, data) =>
    api.adminUpdateFarmer(id, data),

  deleteFarmer: (id) =>
    api.adminDeleteFarmer(id),

  addFarmerCulture: (id, data) =>
    api.adminAddFarmerCulture(id, data),
};