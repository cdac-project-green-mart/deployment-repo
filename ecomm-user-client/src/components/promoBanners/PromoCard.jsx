import React from 'react'
import { Link } from 'react-router-dom'

export default function PromoCard({ bgImage, title, subtitle, highlight, countdown }) {
  return (
    <div
      className="
        relative rounded-2xl overflow-hidden w-[424px] h-[536px] 
        flex flex-col items-center justify-center text-white p-6
      "
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Optional overlay for darker effect */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 text-center">
        {subtitle && <p className="text-sm opacity-80 uppercase tracking-wide">{subtitle}</p>}

        <h2 className="text-2xl font-bold mt-1 mb-2">{title}</h2>

        {highlight && <p className="text-lg font-semibold text-yellow-400">{highlight}</p>}

        {countdown && (
          <div className="flex justify-center gap-4 mt-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold">00</div>
              <p className="opacity-70">DAYS</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">02</div>
              <p className="opacity-70">HOURS</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">18</div>
              <p className="opacity-70">MINS</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">46</div>
              <p className="opacity-70">SECS</p>
            </div>
          </div>
        )}

        {/* Button */}
        <Link
          to="/products"
          className="inline-block cursor-pointer mt-5 bg-white text-green-600 font-medium px-6 py-2 rounded-full hover:bg-gray-100 transition"
        >
          Shop Now →
        </Link>
      </div>
    </div>
  )
}
