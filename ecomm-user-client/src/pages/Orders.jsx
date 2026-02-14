import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/orderApi";
import { isLoggedIn } from "../utils/cartUtils";

const ITEMS_PER_PAGE = 10;

// Map backend status to display label
const statusToLabel = {
  PENDING: "Processing",
  CONFIRMED: "Processing",
  SHIPPED: "on the way",
  DELIVERED: "Completed",
  CANCELLED: "Cancelled",
  PAYMENT_FAILED: "Cancelled",
};

// Format order ID for display (e.g. #3933)
const formatOrderId = (id) => {
  if (!id) return "#----";
  const str = String(id);
  const last4 = str.replace(/-/g, "").slice(-4);
  const num = parseInt(last4, 16) % 10000;
  return `#${num.toString().padStart(4, "0")}`;
};

// Format date as "4 April, 2021"
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoggedIn()) return;

    getOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) =>
        setError(err.response?.data?.message || err.message || "Failed to load orders")
      )
      .finally(() => setLoading(false));
  }, []);

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Please log in to view your orders.</p>
        <Link to="/login" className="text-green-600 hover:underline">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-green-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        <p className="text-gray-600 mb-4">You have no orders yet.</p>
        <Link to="/products" className="text-green-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Order ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const total = Number(order.totalAmount ?? 0);
                const count = order.items?.length ?? 0;
                const productWord = count === 1 ? "Product" : "Products";
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {formatOrderId(order.id)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      ₹{total.toFixed(2)} ({count} {productWord})
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {statusToLabel[order.status] ?? order.status}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium ${currentPage === p
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
