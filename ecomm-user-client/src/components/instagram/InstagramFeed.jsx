import React from 'react'
import { FaInstagram } from 'react-icons/fa'

import img1 from '../../assets/insta1.jpg'
import img2 from '../../assets/insta2.jpg'
import img3 from '../../assets/insta3.jpg'
import img4 from '../../assets/insta4.jpg'
import img5 from '../../assets/insta5.jpg'
import img6 from '../../assets/insta6.jpg'

export default function InstagramFeed() {
  const images = [img1, img2, img3, img4, img5, img6]

  return (
    <div className="w-full flex justify-center mt-20 mb-16">
      <div className="w-full max-w-[1320px] px-4 text-center">
        {/* TITLE */}
        <h2 className="text-xl font-semibold mb-6">Follow us on Instagram</h2>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {images.map((image, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden cursor-pointer">
              {/* IMAGE */}
              <img src={image} className="w-full h-40 object-cover" alt="instagram" />

              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <FaInstagram className="text-white text-3xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
