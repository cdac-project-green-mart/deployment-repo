import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
} from '../utils/cartUtils'
import { getStockForProducts } from '../api/inventoryApi'

// React component for the Cart page
const Cart = () => {
  const navigate = useNavigate()

  const [cartItems, setCartItems] = useState([])
  const [inventoryByProduct, setInventoryByProduct] = useState({}) // productId -> { stock } from backend-inventory-service

  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    const loadCart = () => {
      const items = getCartItems()
      setCartItems(items)
    }
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  // Fetch inventory from backend-inventory-service for all cart items
  useEffect(() => {
    if (cartItems.length === 0) {
      setInventoryByProduct({})
      return
    }
    const ids = cartItems.map((i) => i.id)
    getStockForProducts(ids).then(setInventoryByProduct)
  }, [cartItems])

  // Function to update the quantity of a specific item (capped by inventory)
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) {
      // Remove the item when quantity drops to zero
      removeItem(id)
      return
    }
    const updatedCart = await updateCartQuantity(id, newQuantity)
    setCartItems(updatedCart)
  }

  // Function to remove an item from cart
  const removeItem = (id) => {
    const updatedCart = removeFromCart(id)
    setCartItems(updatedCart)
  }

  // Calculate subtotal: sum of price * quantity for all items
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Shipping cost (fixed for now)
  const shipping = 0

  // Total = subtotal + shipping
  const total = subtotal + shipping

  // JSX UI
  if (cartItems.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">My Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">My Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Table + Action Buttons in single card */}
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2.5fr_1fr_1.3fr_1fr_0.5fr] gap-x-6 items-center px-6 py-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="text-left">Product</span>
              <span className="text-right">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Subtotal</span>
              <span className="text-center"></span>
            </div>

            {/* Cart Items */}
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2.5fr_1fr_1.3fr_1fr_0.5fr] gap-x-6 items-center px-6 py-4 border-b border-gray-200 last:border-b-0"
              >
                {/* Product column */}
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                    {inventoryByProduct[item.id] != null && inventoryByProduct[item.id]?.stock !== null && (
                      <span className={`text-xs mt-0.5 ${inventoryByProduct[item.id]?.stock === 0 ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                        {inventoryByProduct[item.id]?.stock === 0
                          ? 'Out of stock'
                          : `${inventoryByProduct[item.id]?.stock ?? '?'} available`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price column */}
                <span className="text-gray-700 text-sm text-right tabular-nums">
                  ₹{item.price.toFixed(2)}
                </span>

                {/* Quantity column */}
                <div className="flex justify-center">
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-sm hover:bg-gray-100 text-gray-600"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 text-sm border-x border-gray-300 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-sm hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        inventoryByProduct[item.id] != null &&
                        item.quantity >= (inventoryByProduct[item.id]?.stock ?? 0)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal column */}
                <span className="font-semibold text-sm text-right tabular-nums">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>

                {/* Action column */}
                <div className="flex justify-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* Action Buttons inside same bordered container */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Return to shop
              </button>
              <button
                onClick={() => {
                  // Refresh cart from localStorage
                  const items = getCartItems()
                  setCartItems(items)
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Update Cart
              </button>
            </div>
          </div>

          {/* Coupon Code Section in same style card */}
          <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Coupon Code</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm">
                Apply Coupon
              </button>
            </div>
          </div>
        </div>

        {/* Cart Total Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Cart Total</h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium tabular-nums">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between py-2 text-base font-semibold">
                <span>Total:</span>
                <span className="tabular-nums">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
