import React, { useState } from 'react'
import { addToCart } from '../../utils/cartUtils'
import heart from '../../assets/heart.png'
import bag from '../../assets/bag.png'

export default function HotDealBigCard({ product }) {
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
      className="group h-[654px] border border-gray-200/50 rounded-xl p-6 bg-white 
                    transition-colors duration-200 relative cursor-pointer"
    >
      {/* TOP BADGES */}
      <div className="flex gap-2 mb-3">
        {product.badges?.map((b, i) => (
          <span
            key={i}
            className={`text-xs px-2 py-1 rounded-md ${
              b === 'Best Sale' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {b}
          </span>
        ))}
      </div>

      {/* IMAGE */}
      <div className="w-full h-[220px] flex items-center justify-center mb-4">
        <img src={product.image} alt={product.name} className="h-full object-contain" />
      </div>

      {/* ICONS */}
      <div className="flex justify-between px-3 mb-4">
        <img src={heart} alt="wishlist" className="w-6 opacity-70 group-hover:opacity-100 cursor-pointer" />
        <img 
          src={bag} 
          alt="cart" 
          className="w-6 opacity-70 group-hover:opacity-100 cursor-pointer"
          onClick={handleAddToCart}
        />
      </div>

      {/* ADD TO CART BUTTON */}
      {cartMessage && (
        <p className="text-xs text-amber-600 mb-1">{cartMessage}</p>
      )}
      <button
        onClick={handleAddToCart}
        className={`w-full py-2 rounded-full font-medium transition cursor-pointer ${
          addedToCart
            ? 'bg-green-700 text-white'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {addedToCart ? '✓ Added!' : 'Add to Cart'}
      </button>

      {/* PRODUCT NAME */}
      <p className="mt-4 text-center font-semibold group-hover:text-green-600">{product.name}</p>

      {/* PRICES */}
      <p className="text-center text-sm group-hover:text-green-600">
        <span className="font-bold">${product.price}</span>{' '}
        <span className="line-through text-gray-400">${product.oldPrice}</span>
      </p>

      {/* STARS */}
      <div className="flex justify-center gap-1 my-2 group-hover:text-green-600">
        {'⭐'.repeat(4)}
        <span className="text-gray-400 group-hover:text-green-600">⭐</span>
      </div>

      {/* COUNTDOWN */}
      <div className="grid grid-cols-4 gap-3 text-center mt-4 text-xs text-gray-500 group-hover:text-green-600">
        <div>
          <p className="font-bold text-lg">01</p>DAYS
        </div>
        <div>
          <p className="font-bold text-lg">23</p>HOURS
        </div>
        <div>
          <p className="font-bold text-lg">34</p>MINS
        </div>
        <div>
          <p className="font-bold text-lg">57</p>SECS
        </div>
      </div>
    </div>
  )
}
