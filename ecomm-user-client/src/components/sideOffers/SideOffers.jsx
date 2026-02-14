import React from "react";
import { Link } from "react-router-dom";
import bagImage from "../../assets/vegetable-bag.jpg";
import greenLeaves from "../../assets/side-offer.png";

export default function SideOffers() {
  return (
    <div className="flex flex-col gap-6">
      {/* TOP OFFER */}
      <div
        className="relative rounded-2xl h-[230px] overflow-hidden p-6 bg-white w-full"
        style={{
          backgroundImage: `url(${bagImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",          // <-- key change
          backgroundPosition: "right center",
        }}
      >
        <div className="max-w-[55%]">
          <p className="text-sm text-gray-500">SUMMER SALE</p>
          <h2 className="text-2xl font-bold">75% OFF</h2>
          <p className="text-sm text-gray-600 mb-3">Only Fruit & Vegetable</p>
          <Link
            to="/products"
            className="text-green-700 font-semibold hover:underline cursor-pointer inline-block"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* BOTTOM OFFER */}
      <div
        className="rounded-2xl p-6 h-[230px] text-white flex items-center justify-between"
        style={{
          backgroundImage: `url(${greenLeaves})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div>
          <p className="opacity-80 text-sm">BEST DEAL</p>
          <h2 className="text-xl font-bold leading-tight">
            Special Products <br /> Deal of the Month
          </h2>
          <Link
            to="/products"
            className="text-green-300 mt-3 font-semibold hover:underline cursor-pointer inline-block"
          >
            Shop Now →
          </Link>
        </div>
      </div>
    </div>
  )
}
