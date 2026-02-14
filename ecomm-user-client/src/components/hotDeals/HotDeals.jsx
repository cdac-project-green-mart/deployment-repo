import React from 'react'
import HotDealBigCard from './HotDealBigCard'
import DealProductCard from './DealProductCard'

import cabbage from '../../assets/products/chinese-cabbage.jpg'
import lettuce from '../../assets/products/lettuce.jpg'
import eggplant from '../../assets/products/eggplant.jpg'
import cauliflower from '../../assets/products/cauliflower.jpg'
import capsicum from '../../assets/products/capsicum.jpg'
import chili from '../../assets/products/chili.jpg'
import potatoes from '../../assets/products/potatoes.jpg'
import corn from '../../assets/products/corn.jpg'
import tomato from '../../assets/products/tomato.jpg'
import mango from '../../assets/products/mango.jpg'
import redCapsicum from '../../assets/products/red-capsicum.jpg'

export default function HotDeals({ products: apiProducts = [], loading }) {
  const bigDeal = {
    badges: ['Sale 50%', 'Best Sale'],
    image: cabbage,
    name: 'Chinese cabbage',
    price: 12,
    oldPrice: 24,
  }

  const staticProducts = [
    { image: cabbage, name: 'Chinese cabbage', price: 12 },
    { image: lettuce, name: 'Green Lettuce', price: 9 },
    { image: eggplant, name: 'Eggplant', price: 34 },
    { image: cauliflower, name: 'Fresh Cauliflower', price: 12 },
    { image: capsicum, name: 'Green Capsicum', price: 9, oldPrice: 20, discount: 50 },
    { image: chili, name: 'Green Chili', price: 34 },
    { image: potatoes, name: 'Big Potatoes', price: 12 },
    { image: corn, name: 'Corn', price: 12 },
    { image: redCapsicum, name: 'Red Chili', price: 12 },
    { image: tomato, name: 'Red Tomatoes', price: 9, oldPrice: 20, discount: 50 },
    { image: mango, name: 'Surjipuri Mango', price: 34 },
  ]

  const toDealProduct = (p) => ({
    id: p.id ?? p._id,
    _id: p.id ?? p._id,
    image: p.images?.[0] ?? p.image,
    name: p.name ?? p.title,
    price: p.price,
    oldPrice: p.originalPrice ?? p.oldPrice,
    discount: p.discount,
  })

  const products =
    apiProducts?.length > 0 && !loading
      ? apiProducts.map(toDealProduct)
      : staticProducts

  const topRow = products.slice(0, 4)
  const bottomRow = products.slice(4, 8)

  return (
    <div className="w-full flex justify-center mt-12 mb-16">
      <div className="w-full max-w-[1320px] px-4">
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Hot Deals</h2>
          <button className="text-green-600 font-medium flex items-center gap-1">View All →</button>
        </div>

        {/* MAIN GRID (12 cols, 2 rows fixed) */}
        <div className="grid grid-cols-12 grid-rows-2">
          {/* BIG CARD FIXED SIZE */}
          <div className="col-span-12 lg:col-span-4 row-span-2 h-[654px]">
            <HotDealBigCard product={bigDeal} />
          </div>

          {/* TOP ROW SMALL CARDS */}
          {topRow.map((p, i) => (
            <div key={i} className="col-span-6 md:col-span-3 lg:col-span-2 h-[327px]">
              <DealProductCard product={p} />
            </div>
          ))}

          {/* BOTTOM ROW SMALL CARDS */}
          {bottomRow.map((p, i) => (
            <div key={i} className="col-span-6 md:col-span-3 lg:col-span-2 h-[327px]">
              <DealProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
