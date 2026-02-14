import React from 'react'
import ProductCard from './ProductCard'

import apple from '../../assets/products/apple.jpg'
import orange from '../../assets/products/orange.jpg'
import cabbage from '../../assets/products/chinese-cabbage.jpg'
import lettuce from '../../assets/products/lettuce.jpg'
import eggplant from '../../assets/products/eggplant.jpg'

export default function FeaturedProducts() {
  const products = [
    { image: apple, name: 'Green Apple', price: 14.99, oldPrice: 20.99, discount: 50 },
    { image: orange, name: 'Fresh Indian Malta', price: 20 },
    { image: cabbage, name: 'Chinese cabbage', price: 12 },
    { image: lettuce, name: 'Green Lettuce', price: 9 },
    { image: eggplant, name: 'Eggplant', price: 34 },
  ]

  return (
    <div className="w-full flex justify-center mt-12 mb-16">
      <div className="w-full max-w-[1320px] px-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <button className="cursor-pointer text-green-600 font-medium hover:underline flex items-center gap-1">
            View All →
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((p, i) => (
            <ProductCard
              key={i}
              image={p.image}
              title={p.name}
              price={p.price}
              oldPrice={p.oldPrice}
              rating={4}
              sale={p.discount ? `Sale ${p.discount}%` : null}
              selected={p.active || false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
