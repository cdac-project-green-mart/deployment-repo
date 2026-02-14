/**
 * Checkout – API_REFERENCE: POST /api/checkout (SAGA: validates cart, reserves inventory, creates order, payment).
 * Cart is server-side when logged in (GET /api/orders/cart).
 * Saved addresses loaded from User Service for quick selection.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCartItems, saveCartItems, isLoggedIn } from "../utils/cartUtils";
import { getCart, addToCart, executeCheckout, clearCart } from "../api/orderApi";
import { getAddresses } from "../api/userApi";

const normalizeCart = (serverCart) => {
  const raw = serverCart?.items ?? serverCart ?? [];
  return Array.isArray(raw)
    ? raw.map((i) => ({
      id: i.productId ?? i.id,
      productId: i.productId ?? i.id,
      name: i.name ?? "Product",
      price: Number(i.price ?? 0),
      quantity: i.quantity ?? 1,
      image: i.image,
    }))
    : [];
};

// deployment-repo Cart returns totalPrice
const getCartTotal = (serverCart, items) => {
  const total = serverCart?.total ?? serverCart?.totalPrice;
  if (typeof total === "number") return total;
  if (total != null) return Number(total) || 0;
  return items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
};

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // saved addresses from User Service
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState("new"); // "new" or address _id

  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: "/checkout" }, replace: true });
      return;
    }
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })();
    setShipping((s) => ({
      ...s,
      name: s.name || user.name || "",
      email: s.email || user.email || "",
    }));

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Load saved addresses from User Service
        try {
          const addrs = await getAddresses();
          setSavedAddresses(addrs);
          // Auto-select default address
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          if (def) {
            setSelectedAddrId(def._id);
            setShipping((s) => ({
              ...s,
              street: def.street || "",
              city: def.city || "",
              zip: def.zip || "",
              country: def.country || "India",
            }));
          }
        } catch (_) { /* no saved addresses, user enters manually */ }

        // Always use localStorage as the source of truth for what the user
        // has in their cart (Cart page edits localStorage directly).
        const local = getCartItems();
        if (local.length > 0) {
          // Clear stale server cart then push the current local cart
          try { await clearCart(); } catch (_) { }
          for (const item of local) {
            try {
              await addToCart({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity ?? 1,
              });
            } catch (_) { }
          }
        }

        const serverCart = await getCart();
        const items = normalizeCart(serverCart);
        const total = getCartTotal(serverCart, items);

        setCartItems(items);
        setCartTotal(Number(total) || items.reduce((s, i) => s + i.price * i.quantity, 0));
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load cart");
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      // deployment-repo CheckoutRequest requires street, city, zip, country (non-empty)
      const shippingAddress = {
        street: shipping.street?.trim() || "Not specified",
        city: shipping.city?.trim() || "Not specified",
        zip: shipping.zip?.trim() || "000000",
        country: shipping.country?.trim() || "India",
        name: shipping.name?.trim() || "",
        email: shipping.email?.trim() || "",
        phone: shipping.phone?.trim() || "",
      };
      const result = await executeCheckout({
        shippingAddress,
        paymentMethod: "CREDIT_CARD",
      });
      // deployment-repo CheckoutResponse: { success, orderId, transactionId, message }
      const id = result?.orderId ?? result?.data?.orderId ?? result?.id;
      setOrderId(id);
      saveCartItems([]);
      try {
        await clearCart();
      } catch (_) { }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      setDone(true);
      setTimeout(() => navigate(id ? `/orders/${id}` : "/orders"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message;
      setError(msg || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn()) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600">Loading checkout…</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-green-600 hover:underline font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-green-700 mb-2">Checkout successful</h2>
          <p className="text-gray-600 mb-4">Your order is confirmed. Redirecting…</p>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
  const total = cartTotal || subtotal;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
            <ul className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <li key={item.id ?? item.productId} className="flex justify-between text-sm text-gray-700">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

            {/* Saved address picker */}
            {savedAddresses.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Use a saved address</label>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedAddrId === addr._id ? "border-green-500 bg-green-50/40" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="savedAddr"
                        checked={selectedAddrId === addr._id}
                        onChange={() => {
                          setSelectedAddrId(addr._id);
                          setShipping((s) => ({
                            ...s,
                            street: addr.street || "",
                            city: addr.city || "",
                            zip: addr.zip || "",
                            country: addr.country || "India",
                          }));
                        }}
                        className="mt-1 accent-green-600"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{addr.street || "—"}</p>
                        <p className="text-gray-600">{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")} · {addr.country}</p>
                        {addr.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
                      </div>
                    </label>
                  ))}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedAddrId === "new" ? "border-green-500 bg-green-50/40" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="savedAddr"
                      checked={selectedAddrId === "new"}
                      onChange={() => {
                        setSelectedAddrId("new");
                        setShipping((s) => ({ ...s, street: "", city: "", zip: "", country: "India" }));
                      }}
                      className="accent-green-600"
                    />
                    <span className="text-sm font-medium text-gray-700">+ Enter a new address</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={shipping.name}
                  onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={shipping.email}
                  onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                <input
                  type="text"
                  required
                  value={shipping.street}
                  onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
                <input
                  type="text"
                  required
                  value={shipping.zip}
                  onChange={(e) => setShipping((s) => ({ ...s, zip: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={shipping.country}
                  onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={shipping.phone}
                  onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="e.g. +91 9876543210"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              to="/cart"
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center"
            >
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-70 transition"
            >
              {submitting ? "Processing…" : "Place Order & Pay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
