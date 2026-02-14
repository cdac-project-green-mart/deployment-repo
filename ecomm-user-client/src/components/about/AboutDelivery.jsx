import React from 'react'
import deliveryboy from '../../assets/deliveryboy.png'
import tick from '../../assets/tick.svg' // green tick icon
import { Link } from 'react-router-dom'
export default function AboutDelivery() {
  return (
    <section className="pt-18 pb-18 bg-white">
      <div className="mx-auto max-w-[1364px] px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT TEXT */}
        <div className="max-w-[607px]">
          {/* Heading */}
          <h2 className="text-[56px] font-semibold leading-[1.2] text-[#1A1A1A] mb-6">
            We Deliver. You
            <br />
            Enjoy Your Order.
          </h2>

          {/* Paragraph */}
          <p className="text-[18px] font-normal leading-[1.5] text-[#666666] max-w-[590px] mb-6">
            Experience the joy of effortless healthy living.
            <br />
            Each order is thoughtfully curated with farm-fresh ingredients, responsibly sourced, and
            delivered with care. From the moment you choose your items to the moment they arrive at
            your door, we ensure freshness, precision, and a delightful experience throughout.
          </p>

          {/* GREEN TICK LIST */}
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3">
              <img src={tick} alt="tick" className="w-5 h-5" />
              <span className="text-[#1A1A1A] text-[16px]">Perfectly fresh, every time</span>
            </li>

            <li className="flex items-center gap-3">
              <img src={tick} alt="tick" className="w-5 h-5" />
              <span className="text-[#1A1A1A] text-[16px]">Secure & quick delivery </span>
            </li>

            <li className="flex items-center gap-3">
              <img src={tick} alt="tick" className="w-5 h-5" />
              <span className="text-[#1A1A1A] text-[16px]">
                Easy and delightful shopping experience
              </span>
            </li>
          </ul>

          {/* SHOP NOW BUTTON */}
          <Link
            to="/products"
            className="bg-[#16A34A] text-white px-8 py-3 rounded-full text-[16px] font-medium inline-flex items-center gap-2 hover:bg-[#12893F] transition"
          >
            Shop Now
            <span className="text-xl">→</span>
          </Link>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-end">
          <img
            src={deliveryboy}
            alt="Delivery Boy"
            className="w-[716px] h-[492px] rounded-[8px] object-cover"
          />
        </div>
      </div>
    </section>
  )
}
