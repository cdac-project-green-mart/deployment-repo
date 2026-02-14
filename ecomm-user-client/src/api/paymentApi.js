/**
 * Payment API – deployment-repo payment-service
 * GET /api/payments (user transactions), GET /api/payments/:transactionId
 * Note: Payment processing is done by checkout-service internally during checkout.
 */
import api from './axios';

export const getTransaction = async (transactionId) => {
  const { data } = await api.get(`/payments/${transactionId}`);
  return data?.data ?? data;
};

export const getUserTransactions = async () => {
  const { data } = await api.get('/payments');
  const payload = data?.data ?? data;
  return Array.isArray(payload) ? payload : payload?.transactions ?? [];
};
