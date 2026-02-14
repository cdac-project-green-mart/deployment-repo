import React from "react";
import promoImg from "../../assets/promo-banner.jpg";

export default function SummerSale() {
  return (
    <div className="w-full flex justify-center mt-10 mb-10">
      <div
        className="w-full max-w-[1320px] rounded-2xl h-[358px] flex items-center justify-between overflow-hidden px-10"
        style={{
          backgroundImage: `url(${promoImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* RIGHT TEXT AREA */}
        <div className="ml-auto max-w-[350px] text-white">
          <p className="text-xs tracking-wide opacity-90">SUMMER SALE</p>

          <h2 className="text-4xl font-bold mt-1">
            <span className="text-orange-400">37%</span> OFF
          </h2>

          <p className="mt-2 text-sm opacity-90 leading-relaxed">
            Free on all your order, Free Shipping and 30 days
            money-back guarantee
          </p>

          <button className="cursor-pointer mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition">
            Shop Now →
          </button>
        </div>
      </div>
    </div>
  );
}
