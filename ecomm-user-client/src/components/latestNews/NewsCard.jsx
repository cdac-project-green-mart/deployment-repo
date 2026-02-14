import React from 'react'

export default function NewsCard({ image, day, month, title }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer">
      {/* IMAGE + DATE BADGE */}
      <div className="relative w-full h-[220px]">
        <img src={image} alt={title} className="w-full h-full object-cover" />

        {/* DATE BADGE */}
        <div className="absolute bottom-3 left-3 bg-white rounded-md shadow px-3 py-1 text-center">
          <p className="text-lg font-bold leading-none">{day}</p>
          <p className="text-[10px] text-gray-600">{month}</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* META INFO */}
        <div className="flex items-center gap-4 text-gray-500 text-xs mb-3">
          <span>🍽️ Food</span>
          <span>👤 By Admin</span>
          <span>💬 65 Comments</span>
        </div>

        {/* TITLE */}
        <p className="text-sm text-gray-800 mb-3">{title}</p>

        {/* READ MORE */}
        <button className="text-green-600 text-sm font-semibold hover:underline flex items-center gap-1">
          Read More →
        </button>
      </div>
    </div>
  )
}
