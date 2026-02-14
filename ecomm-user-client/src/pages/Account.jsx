import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logout } from "../utils/cartUtils";
import * as userApi from "../api/userApi";
import { getUserTransactions } from "../api/paymentApi";
import * as orderApi from "../api/orderApi";

// ─── helpers ────────────────────────────────────────
const EMPTY_ADDR = { street: "", city: "", state: "", zip: "", country: "India", isDefault: false };

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const statusBadge = (status) => {
  const map = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

// ─── component ──────────────────────────────────────
export default function Account() {
  const navigate = useNavigate();

  // auth user (from localStorage as seed)
  const [user, setUser] = useState(null);

  // profile from User Service
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ phone: "", newsletter: true });
  const [profileMsg, setProfileMsg] = useState("");

  // addresses
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDR });
  const [editingAddrId, setEditingAddrId] = useState(null); // null = adding, string = editing
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrMsg, setAddrMsg] = useState("");

  // payment history
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);

  // cart summary
  const [cartSummary, setCartSummary] = useState({ items: 0, total: 0 });

  // ─── Load everything ──────────────────────────────
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: "/account" }, replace: true });
      return;
    }

    // seed from localStorage
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    } catch { setUser({}); }

    // profile
    userApi.getProfile()
      .then((p) => {
        setProfile(p);
        setProfileDraft({ phone: p?.phone || "", newsletter: p?.preferences?.newsletter ?? true });
      })
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));

    // addresses
    userApi.getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));

    // transactions
    getUserTransactions()
      .then((t) => setTransactions(Array.isArray(t) ? t : []))
      .catch(() => setTransactions([]))
      .finally(() => setTxnLoading(false));

    // cart summary
    const loadCart = async () => {
      try {
        const c = await orderApi.getCart();
        const items = c?.items ?? [];
        const count = items.reduce((n, i) => n + (i.quantity ?? 0), 0);
        const total = c?.total ?? c?.totalPrice ?? items.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 0), 0);
        setCartSummary({ items: count, total: Number(total) || 0 });
      } catch { setCartSummary({ items: 0, total: 0 }); }
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [navigate]);

  // ─── Profile handlers ─────────────────────────────
  const handleSaveProfile = async () => {
    setProfileMsg("");
    try {
      const updated = await userApi.updateProfile({
        phone: profileDraft.phone,
        preferences: { newsletter: profileDraft.newsletter },
      });
      setProfile(updated);
      setEditingProfile(false);
      setProfileMsg("Profile updated!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to update profile");
    }
  };

  // ─── Address handlers ─────────────────────────────
  const openAddForm = () => {
    setEditingAddrId(null);
    setAddrForm({ ...EMPTY_ADDR });
    setShowAddrForm(true);
    setAddrMsg("");
  };

  const openEditForm = (addr) => {
    setEditingAddrId(addr._id);
    setAddrForm({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "India",
      isDefault: addr.isDefault || false,
    });
    setShowAddrForm(true);
    setAddrMsg("");
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddrMsg("");
    try {
      if (editingAddrId) {
        await userApi.updateAddress(editingAddrId, addrForm);
        setAddrMsg("Address updated!");
      } else {
        await userApi.addAddress(addrForm);
        setAddrMsg("Address added!");
      }
      const fresh = await userApi.getAddresses();
      setAddresses(fresh);
      setShowAddrForm(false);
      setTimeout(() => setAddrMsg(""), 3000);
    } catch (err) {
      setAddrMsg(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await userApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      setAddrMsg("Address deleted");
      setTimeout(() => setAddrMsg(""), 3000);
    } catch (err) {
      setAddrMsg(err.response?.data?.message || "Failed to delete address");
    }
  };

  // ─── Logout ───────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    window.dispatchEvent(new CustomEvent("authChanged"));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  // ─── Loading / guard ──────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading account…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">My Account</h1>

        {/* ─── Top row: Profile + Cart Summary ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              {!editingProfile && (
                <button onClick={() => setEditingProfile(true)} className="text-sm text-green-600 hover:underline">
                  Edit
                </button>
              )}
            </div>

            {profileMsg && (
              <p className={`text-sm mb-3 ${profileMsg.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
                {profileMsg}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-lg font-medium">{user.name || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <p className="text-lg font-medium capitalize">{user.role?.toLowerCase() || "Customer"}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                {editingProfile ? (
                  <input
                    type="tel"
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile?.phone || "Not set"}</p>
                )}
              </div>

              {/* Newsletter */}
              <div>
                <label className="text-sm text-gray-500">Newsletter</label>
                {editingProfile ? (
                  <label className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={profileDraft.newsletter}
                      onChange={(e) => setProfileDraft((d) => ({ ...d, newsletter: e.target.checked }))}
                      className="accent-green-600"
                    />
                    <span className="text-sm">Receive newsletter emails</span>
                  </label>
                ) : (
                  <p className="text-lg font-medium">{profile?.preferences?.newsletter ? "Subscribed" : "Not subscribed"}</p>
                )}
              </div>

              {editingProfile && (
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition">
                    Save
                  </button>
                  <button onClick={() => setEditingProfile(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Items in cart:</span>
                <span className="font-medium">{cartSummary.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-green-600">₹{cartSummary.total.toFixed(2)}</span>
              </div>
              <Link to="/cart" className="block w-full mt-4 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                View Cart
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Address Book ─── */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <button onClick={openAddForm} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition">
              + Add Address
            </button>
          </div>

          {addrMsg && (
            <p className={`text-sm mb-3 ${addrMsg.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
              {addrMsg}
            </p>
          )}

          {addrLoading ? (
            <p className="text-gray-500 text-sm">Loading addresses…</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved addresses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr._id} className={`border rounded-lg p-4 relative ${addr.isDefault ? "border-green-500 bg-green-50/30" : "border-gray-200"}`}>
                  {addr.isDefault && (
                    <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Default</span>
                  )}
                  <p className="font-medium text-gray-800">{addr.street || "—"}</p>
                  <p className="text-sm text-gray-600">
                    {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">{addr.country}</p>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => openEditForm(addr)} className="text-sm text-green-600 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteAddress(addr._id)} className="text-sm text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Address form modal */}
          {showAddrForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
              <form onSubmit={handleSaveAddress} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-semibold">{editingAddrId ? "Edit Address" : "Add New Address"}</h3>
                <input type="text" placeholder="Street" value={addrForm.street}
                  onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="City" value={addrForm.city}
                    onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="text" placeholder="State" value={addrForm.state}
                    onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="ZIP" value={addrForm.zip}
                    onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="text" placeholder="Country" value={addrForm.country}
                    onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={addrForm.isDefault}
                    onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="accent-green-600" />
                  Set as default address
                </label>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddrForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition">
                    {editingAddrId ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ─── Payment History ─── */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          {txnLoading ? (
            <p className="text-gray-500 text-sm">Loading payments…</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Date</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Amount</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Method</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Status</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium uppercase tracking-wide text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((txn) => (
                    <tr key={txn.transactionId} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-3 text-gray-700">{formatDate(txn.createdAt)}</td>
                      <td className="py-3 px-3 text-gray-700 tabular-nums">₹{Number(txn.amount ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-gray-600">{txn.paymentMethod ?? "—"}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {txn.orderId && (
                          <Link to={`/orders/${txn.orderId}`} className="text-green-600 hover:underline text-xs font-medium">
                            View Order
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Quick Links ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/orders" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Order History</h3>
                <p className="text-sm text-gray-500">View your past orders</p>
              </div>
            </div>
          </Link>

          <Link to="/cart" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Shopping Cart</h3>
                <p className="text-sm text-gray-500">{cartSummary.items} items in cart</p>
              </div>
            </div>
          </Link>

          <Link to="/products" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Continue Shopping</h3>
                <p className="text-sm text-gray-500">Browse products</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
          Logout
        </button>
      </div>
    </div>
  );
}
