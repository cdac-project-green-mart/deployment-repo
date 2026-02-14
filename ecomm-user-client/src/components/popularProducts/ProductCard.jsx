import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { addToCart } from '../../utils/cartUtils'
import { getStock } from '../../api/inventoryApi'

import heartIcon from '../../assets/heart.png'
import bagIcon from '../../assets/bag.png'

export default function ProductCard({
  _id,
  image,
  title,
  price,
  oldPrice,
  rating = 4,
  sale,
  selected
}) {
  const [liked, setLiked] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState(null)
  const [inventory, setInventory] = useState(null) // deployment-repo inventory service

  useEffect(() => {
    getStock(_id).then(setInventory).catch(() => setInventory(null))
  }, [_id])

  const isRed = liked || hovered
  const outOfStock = inventory != null && inventory.stock === 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    setCartMessage(null)
    const result = await addToCart({ _id, title, price, image }, 1)
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
  };

  return (
    <Link
      to={`/products/${_id}`}  // ← Yeh line card ko clickable banati hai
      className="block"        // ← Yeh pura card clickable banata hai
    >
      <div
        className={`
          relative border rounded-xl p-4 bg-white transition cursor-pointer h-full flex flex-col
          ${selected ? 'border-green-600 shadow-[0_0_6px_rgba(0,200,0,0.3)]' : 'border-gray-200/60'}
          hover:border-green-500 hover:shadow-[0_0_6px_rgba(0,200,0,0.3)]
        `}
      >
        {/* SALE BADGE */}
        {sale && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-20">
            {sale}
          </span>
        )}
        {/* Out of stock from deployment-repo inventory service */}
        {outOfStock && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-20">
            Out of stock
          </span>
        )}

        {/* HEART ICON (Wishlist) */}
        <div
          className="absolute top-2 right-2 cursor-pointer z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked((prev) => !prev);
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={heartIcon}
            alt="wishlist"
            style={{
              width: '20px',
              height: '20px',
              filter: isRed
                ? 'invert(23%) sepia(94%) saturate(7480%) hue-rotate(356deg) brightness(96%) contrast(106%)'
                : 'none',
              transition: 'filter 150ms ease',
            }}
          />
        </div>

        {/* IMAGE — fixed-height centered container prevents stretching */}
        <div className="w-full h-[150px] flex items-center justify-center bg-gray-50 rounded mb-3 overflow-hidden">
          <img
            src={image || '/placeholder-product.jpg'}
            alt={title}
            className="max-w-full max-h-full object-contain"
            onError={(e) => { e.target.src = '/placeholder-product.jpg' }}
          />
        </div>

        {/* TITLE */}
        <p className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]">{title}</p>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-1">
          <p className="text-green-600 font-semibold">₹{price}</p>
          {oldPrice && <p className="line-through text-gray-400 text-sm">₹{oldPrice}</p>}
        </div>

        {/* RATING */}
        <div className="flex items-center text-xs mt-1">
          <span className="text-orange-400">{'★'.repeat(rating)}</span>
          <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
        </div>
        {cartMessage && (
          <p className="text-xs mt-1 text-amber-600">{cartMessage}</p>
        )}

        {/* CART ICON */}
        <div
          className="absolute bottom-3 right-3 z-10"
          onClick={outOfStock ? undefined : handleAddToCart}
        >
          {addedToCart ? (
            <div className="w-5 h-5 flex items-center justify-center bg-green-600 rounded-full">
              <span className="text-white text-xs">✓</span>
            </div>
          ) : (
            <img
              src={bagIcon}
              alt="cart"
              className={`w-5 h-5 transition ${outOfStock ? 'opacity-40 cursor-not-allowed' : 'opacity-80 hover:opacity-100 cursor-pointer'
                }`}
              title={outOfStock ? 'Out of stock' : 'Add to cart'}
            />
          )}
        </div>
      </div>
    </Link>
  )
}

