import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CategoryCard({ image, title, category }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/products?category=${encodeURIComponent(category || '')}`)
  }

  return (
    <div
      onClick={handleClick}
      className="
        group
        flex flex-col items-center justify-center 
        border border-gray-200/50 rounded-xl 
        p-4 bg-white
        hover:shadow-md hover:border-green-500 
        transition cursor-pointer
      "
    >
      <img
        src={image}
        alt={title}
        className="w-[200px] h-[213px] object-contain mb-3"
      />

      <p
        className="
          text-sm font-medium text-gray-700 
          group-hover:text-green-600 
          transition
        "
      >
        {title}
      </p>
    </div>
  )
}
