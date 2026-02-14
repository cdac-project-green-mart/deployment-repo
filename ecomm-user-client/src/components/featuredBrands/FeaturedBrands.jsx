import React from 'react'
import stepsLogo from '../../assets/brand-steps.png'
import mangoLogo from '../../assets/brand-mango.png'
import foodLogo from '../../assets/brand-food.png'
import bookLogo from '../../assets/brand-bookoff.png'
import gseriesLogo from '../../assets/brand-gseries.png'

export default function FeaturedBrands() {
  const brands = [
    { img: stepsLogo, alt: 'Steps' },
    { img: mangoLogo, alt: 'Mango' },
    { img: foodLogo, alt: 'Food' },
    { img: bookLogo, alt: 'Book Off' },
    { img: gseriesLogo, alt: 'G Series' },
  ]

  return (
    <div className="w-full flex justify-center my-12">
      <div className="w-full max-w-[1320px] px-4">
        {/* Brands Row */}
        <div className="flex justify-between items-center opacity-50">
          {brands.map((b, i) => (
            <img key={i} src={b.img} alt={b.alt} className="h-10 object-contain" />
          ))}
        </div>
      </div>
    </div>
  )
}
