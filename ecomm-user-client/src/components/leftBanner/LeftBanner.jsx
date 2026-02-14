import React from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../../assets/banner-img.jpg'

export default function LeftHeroBanner() {
  return (
    <div
      className="rounded-2xl p-10 h-[480px] flex items-center"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* LEFT TEXT ZONE */}
      <div className="max-w-md text-white space-y-4 font-medium">
        <h2 className="text-4xl font-bold leading-tight">
          Fresh & Healthy <br /> Organic Food
        </h2>

        <div className=" w-max px-3 py-1 rounded-md">
          <span className="font-semibold">Sale up to</span>{' '}
          <span className="bg-[#FF8A00] text-black px-2 py-1 rounded">30% OFF</span>
        </div>

        <p className="opacity-90 text-sm">Free shipping on all your order.</p>

        <Link
          to="/products"
          className="inline-block bg-white text-[#00B207] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition cursor-pointer"
        >
          Shop now →
        </Link>
      </div>
    </div>
  )
}
