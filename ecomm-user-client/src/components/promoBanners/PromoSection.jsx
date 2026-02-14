import React from 'react'
import PromoCard from './PromoCard'

import saleVeg from '../../assets/sale-veg.jpg'
import meatImg from '../../assets/lower-meat.jpg'
import freshFruit from '../../assets/fresh-fruit-banner.jpg'

export default function PromoSection() {
  return (
    <div className="my-12 w-full flex justify-center">
      <div className="w-full max-w-[1320px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          {/* SALE OF MONTH */}
          <PromoCard bgImage={saleVeg} subtitle="Best Deals" title="Sale of the Month" countdown />

          {/* LOW FAT MEAT */}
          <PromoCard
            bgImage={meatImg}
            subtitle="85% Fat Free"
            title="Low-Fat Meat"
            highlight="Started at $79.99"
          />

          {/* FRESH FRUIT */}
          <PromoCard
            bgImage={freshFruit}
            subtitle="Summer Sale"
            title="100% Fresh Fruit"
            highlight="Up to 64% OFF"
          />
        </div>
      </div>
    </div>
  )
}
