import { api } from "./api";

export const transactionService = {
  getOrders: () => api.orders(),
  createOrder: (cropId, data) => api.createOrder(cropId, data),
  orderAction: (id, action) => api.orderAction(id, action),
  getReservations: () => api.reservations(),
  createReservation: (cropId, data) => api.createReservation(cropId, data),
  reservationAction: (id, action) => api.reservationAction(id, action),
};
