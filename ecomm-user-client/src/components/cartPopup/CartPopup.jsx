import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  isLoggedIn,
} from '../../utils/cartUtils'
import { getStockForProducts } from '../../api/inventoryApi'

export default function CartPopup({ open, onClose }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [inventoryByProduct, setInventoryByProduct] = useState({})

  useEffect(() => {
    const loadCart = () => {
      const cartItems = getCartItems()
      setItems(cartItems)
    }
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  // Fetch inventory from backend-inventory-service for cart items
  useEffect(() => {
    if (items.length === 0) {
      setInventoryByProduct({})
      return
    }
    getStockForProducts(items.map((i) => i.id)).then(setInventoryByProduct)
  }, [items])

  const removeItem = (id) => {
    const updatedCart = removeFromCart(id)
    setItems(updatedCart)
  }

  const increaseQty = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const updatedCart = await updateCartQuantity(id, item.quantity + 1)
    setItems(updatedCart)
  }

  const decreaseQty = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    // updateCartQuantity(id, 0) internally calls removeFromCart
    const updatedCart = await updateCartQuantity(id, item.quantity - 1)
    setItems(updatedCart)
  }

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] bg-white z-50 shadow-xl p-5 transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Shopping Cart ({items.length})</h2>
          <button onClick={onClose} className="cursor-pointer text-xl font-medium">
            ×
          </button>
        </div>

        {/* PRODUCT LIST */}
        <div className="flex-1 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
              <Link
                to="/products"
                onClick={onClose}
                className="text-green-600 hover:underline mt-2 inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className={`flex items-center gap-3 p-3 mb-4 rounded relative ${item.bordered ? 'border border-dashed border-gray-300' : ''
                  }`}
              >
                <button
                  className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-black text-sm"
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </button>

                <img
                  src={item.image || item.img || '/placeholder.jpg'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex flex-col flex-1">
                  <p className="font-medium text-[15px]">{item.name}</p>

                  <p className="text-gray-500 text-sm">
                    ₹{item.price.toFixed(2)} per item
                    {inventoryByProduct[item.id] != null && (
                      <span className={inventoryByProduct[item.id]?.stock === 0 ? ' text-red-600 ml-1' : ''}>
                        {' '}({inventoryByProduct[item.id]?.stock === 0 ? 'Out of stock' : `${inventoryByProduct[item.id]?.stock} available`})
                      </span>
                    )}
                  </p>

                  <p className="text-black text-sm font-semibold mt-1">
                    Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                  </p>

                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 w-fit mt-2">
                    <button
                      className="cursor-pointer w-7 h-7 flex items-center justify-center text-lg font-semibold text-gray-700 hover:bg-gray-200 rounded-full"
                      onClick={() => item.quantity <= 1 ? removeItem(item.id) : decreaseQty(item.id)}
                    >
                      {item.quantity <= 1 ? '🗑' : '-'}
                    </button>

                    <span className="px-4 font-medium">{item.quantity}</span>

                    <button
                      className="cursor-pointer w-7 h-7 flex items-center justify-center text-lg font-semibold text-gray-700 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => increaseQty(item.id)}
                      disabled={
                        inventoryByProduct[item.id] != null &&
                        item.quantity >= (inventoryByProduct[item.id]?.stock ?? 0)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div>
          <div className="flex justify-between text-[15px] mb-4">
            <span className="text-gray-700">
              {items.length} {items.length === 1 ? 'Product' : 'Products'}
            </span>
            <span className="font-semibold">₹{totalPrice}</span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose()
                if (isLoggedIn()) {
                  navigate('/checkout')
                } else {
                  navigate('/login', { state: { from: '/checkout' } })
                }
              }}
              className="cursor-pointer bg-green-600 text-white py-3 rounded-full font-semibold text-[15px]"
            >
              Checkout
            </button>

            <Link
              to="/cart"
              onClick={onClose}
              className="text-center cursor-pointer bg-green-100 text-green-700 py-3 rounded-full font-semibold text-[15px]"
            >
              Go To Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
