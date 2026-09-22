import { api } from "./api";

export const authService = {
  login: (form) => api.login(form),

  register: (form) => api.register(form),

  logout: () => api.logout(),

  me: () => api.me(),

  //ajout pokkkk
  updateProfile: (data) =>
  api.updateProfile(data),

getProfile: () =>
  api.getProfile(),
};

