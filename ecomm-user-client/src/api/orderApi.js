/**
 * Order & Cart API – deployment-repo order-service + checkout-service
 *
 * Cart:     GET /api/orders/cart, POST /api/orders/cart/add,
 *           PUT /api/orders/cart/update, DELETE /api/orders/cart/remove,
 *           DELETE /api/orders/cart/clear
 * Orders:   GET /api/orders, GET /api/orders/:orderId
 * Checkout: POST /api/checkout (SAGA orchestrator)
 */
import api from './axios';

/** Unwrap { success, data } envelope — returns data or raw body */
const unwrap = (res) => {
  const body = res?.data ?? res;
  return body?.data ?? body;
};

// ——————————— Cart ———————————

export const getCart = async () => {
  const { data } = await api.get('/orders/cart');
  return unwrap({ data });
};

export const addToCart = async ({ productId, name, price, quantity }) => {
  const { data } = await api.post('/orders/cart/add', {
    productId: String(productId),
    name,
    price,
    quantity: quantity ?? 1,
  });
  return unwrap({ data });
};

export const updateCartItem = async (productId, quantity) => {
  const { data } = await api.put('/orders/cart/update', null, {
    params: { productId: String(productId), quantity },
  });
  return unwrap({ data });
};

export const removeFromCartApi = async (productId) => {
  const { data } = await api.delete('/orders/cart/remove', {
    params: { productId: String(productId) },
  });
  return unwrap({ data });
};

export const clearCart = async () => {
  const { data } = await api.delete('/orders/cart/clear');
  return unwrap({ data });
};

// ——————————— Orders ———————————

export const getOrders = async () => {
  const { data } = await api.get('/orders');
  const payload = unwrap({ data });
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};

export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return unwrap({ data });
};

// ——————————— Checkout (SAGA) ———————————

/**
 * Execute checkout: reserves inventory → creates order → processes payment.
 * @param {{ shippingAddress: { street, city, zip, country }, paymentMethod: string }} params
 * @returns {{ success, orderId, transactionId, message }}
 */
export const executeCheckout = async ({ shippingAddress, paymentMethod }) => {
  const { data } = await api.post('/checkout', {
    shippingAddress,
    paymentMethod,
  });
  return data;
};
