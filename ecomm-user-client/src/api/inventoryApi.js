/**
 * Inventory API – deployment-repo inventory-service
 * GET /api/inventory/:productId → { success, data: { productId, quantity, reserved, ... } }
 * POST /api/inventory/:productId/add, POST /api/inventory/:productId/reduce
 */
import api from './axios';

/**
 * Get stock info for a single product.
 * Returns { stock, quantity, reserved } or null if not found.
 */
export const getStock = async (productId) => {
  try {
    const { data } = await api.get(`/inventory/${String(productId)}`);
    // API returns { success, data: { productId, quantity, reserved, lowStockThreshold, lastUpdated } }
    const inv = data?.data ?? data;
    const quantity = inv?.quantity ?? 0;
    const reserved = inv?.reserved ?? 0;
    return { stock: quantity - reserved, quantity, reserved };
  } catch (err) {
    if (err.response?.status === 404) return null;
    console.error(`[inventoryApi] getStock(${productId}):`, err);
    throw err;
  }
};

/**
 * Get stock info for multiple products in parallel.
 * Returns { [productId]: { stock, quantity, reserved } | null }
 */
export const getStockForProducts = async (productIds) => {
  const entries = await Promise.all(
    productIds.map(async (id) => {
      try {
        const stock = await getStock(id);
        return [id, stock];
      } catch {
        return [id, null];
      }
    })
  );
  return Object.fromEntries(entries);
};

/** Add stock (Vendor/Admin): POST /api/inventory/:productId/add */
export const increaseStock = async (productId, quantity) => {
  const { data } = await api.post(`/inventory/${String(productId)}/add`, {
    quantity,
  });
  return data;
};

/** Reduce stock (Vendor/Admin): POST /api/inventory/:productId/reduce */
export const decreaseStock = async (productId, quantity) => {
  const { data } = await api.post(`/inventory/${String(productId)}/reduce`, {
    quantity,
  });
  return data;
};

/** Check availability for multiple items: POST /api/inventory/check-availability */
export const checkAvailability = async (items) => {
  const { data } = await api.post('/inventory/check-availability', { items });
  return data?.data ?? data;
};
