import { api } from "./api";

export const buyerService = {
  getCrops: (filters) => api.buyerCrops(filters),
  startConversation: (cropId) => api.startBuyerConversation(cropId),
  getConversations: () => api.conversations(),
  getMessages: (conversationId) => api.conversationMessages(conversationId),
  sendMessage: (conversationId, data) => api.sendConversationMessage(conversationId, data),
  getMessageAudio: (messageId) => api.messageAudio(messageId),
};
