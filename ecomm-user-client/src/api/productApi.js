/**
 * Product API – deployment-repo product-service
 * GET /api/products, GET /api/products/:id, GET /api/products/categories
 * Response: { success, data: [...products], pagination? }
 */
import api from './axios';

const PRODUCTS_BASE = '/products';

/** Normalize products from API: handles data | data.products | array */
const toProductsArray = (body) => {
  if (Array.isArray(body)) return body;
  const arr = body?.data ?? body?.products;
  return Array.isArray(arr) ? arr : [];
};

export const getAllProducts = async (params = {}) => {
  const { page = 1, limit = 20, category, search, minPrice, maxPrice } = params;
  const response = await api.get(PRODUCTS_BASE, {
    params: { page, limit, category, search, minPrice, maxPrice },
  });
  const body = response.data;
  const products = toProductsArray(body);
  const pagination = body?.pagination ?? { page, limit, total: products.length };
  return { products, pagination };
};

export const getProductById = async (id) => {
  const response = await api.get(`${PRODUCTS_BASE}/${id}`);
  // API returns { success, data: { ...product } }
  return response.data?.data ?? response.data;
};

export const getCategories = async () => {
  const response = await api.get(`${PRODUCTS_BASE}/categories`);
  // API returns { success, data: ["Fruits", "Vegetables", ...] }
  return response.data?.data ?? response.data ?? [];
};

export const searchProducts = async (query) => {
  const response = await api.get(PRODUCTS_BASE, { params: { search: query, limit: 20 } });
  const body = response.data;
  return toProductsArray(body);
};
