import React, { useState } from 'react'
import { addToCart } from '../../utils/cartUtils'
import bag from '../../assets/bag.png'

export default function DealProductCard({ product }) {
  const [addedToCart, setAddedToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState(null)

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    setCartMessage(null)
    const result = await addToCart(
      {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1
    )
    if (result.success) {
      setAddedToCart(true)
      if (result.message) setCartMessage(result.message)
      setTimeout(() => {
        setAddedToCart(false)
        setCartMessage(null)
      }, 2000)
    } else if (result.message) {
      setCartMessage(result.message)
      setTimeout(() => setCartMessage(null), 2000)
    }
  }
  return (
    <div
      className="relative group border border-gray-200/50 rounded-xl bg-white 
                    h-[327px] w-full p-4 flex flex-col justify-between cursor-pointer
                    hover:text-green-600 transition"
    >
      {/* Discount Badge */}
      {product.discount && (
        <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
          Sale {product.discount}%
        </span>
      )}

      {/* IMAGE */}
      <div className="w-full h-[120px] flex items-center justify-center">
        <img src={product.image} alt={product.name} className="h-full object-contain" />
      </div>

      {/* NAME */}
      <p className="mt-3 text-sm font-medium group-hover:text-green-600">{product.name}</p>

      {/* PRICE */}
      <p className="text-sm font-semibold group-hover:text-green-600">
        ${product.price}{' '}
        {product.oldPrice && (
          <span className="line-through text-gray-400 text-xs">${product.oldPrice}</span>
        )}
      </p>

      {/* STARS */}
      <div className="text-yellow-500 text-xs group-hover:text-green-600">
        {'⭐'.repeat(4)} <span className="text-gray-400 group-hover:text-green-600">⭐</span>
      </div>

      {/* BUTTON + CART ICON */}
      {cartMessage && (
        <p className="text-xs text-amber-600 mt-1">{cartMessage}</p>
      )}
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={handleAddToCart}
          className={`cursor-pointer px-4 py-1 rounded-full text-xs transition ${
            addedToCart
              ? 'bg-green-700 text-white'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {addedToCart ? '✓ Added!' : 'Add to Cart'}
        </button>

        <img
          src={bag}
          className="w-5 mt-0.5 opacity-70 group-hover:opacity-100 cursor-pointer"
          onClick={handleAddToCart}
          alt="Add to cart"
        />
      </div>
    </div>
  )
}
