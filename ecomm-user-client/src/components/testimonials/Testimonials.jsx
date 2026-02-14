import React, { useState } from "react";

// Import your user images
import user1 from "../../assets/user-1.jpg";
import user2 from "../../assets/user-2.jpg";
import user3 from "../../assets/user-3.jpg";
import user4 from "../../assets/user-4.jpg";
import user5 from "../../assets/user-5.jpg";
import user6 from "../../assets/user-6.jpg";

export default function Testimonials() {
  const testimonials = [
    {
      text: "I’ve been ordering fruits from here for months and the freshness is unreal. The oranges tasted like they were picked the same morning.",
      name: "Robert Fox",
      role: "Customer",
      image: user1
    },
    {
      text: "The quality of the produce is top-notch. Everything from the greens to the eggs feels farm-fresh and cooking becomes way more enjoyable.",
      name: "Dianne Russell",
      role: "Customer",
      image: user2
    },
    {
      text: "As someone who eats clean, finding reliable fresh vegetables is difficult. These always stay crisp for days and taste amazing.",
      name: "Eleanor Pena",
      role: "Customer",
      image: user3
    },
    {
      text: "Delivery is always on time and the packaging is excellent. My leafy veggies arrived perfectly intact and super fresh.",
      name: "Rohit Sharma",
      role: "Customer",
      image: user4
    },
    {
      text: "Great pricing and even better quality. I switched from supermarket runs to ordering here and the difference is huge.",
      name: "Virat Kohli",
      role: "Customer",
      image: user5
    },
    {
      text: "The variety is impressive. I can get everything from basics to premium items in one place without compromising freshness.",
      name: "Steve Smith",
      role: "Customer",
      image: user6
    }
  ];

  const [page, setPage] = useState(0); // 0 = first 3, 1 = next 3

  const visibleCards = testimonials.slice(page * 3, page * 3 + 3);

  const next = () => setPage((p) => (p === 1 ? 1 : p + 1));
  const prev = () => setPage((p) => (p === 0 ? 0 : p - 1));

  return (
    <div className="w-full flex justify-center mt-16 mb-20">
      <div className="w-full max-w-[1320px] px-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Client Testimonials</h2>

          <div className="flex gap-3">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
            >
              ←
            </button>
            <button
              onClick={next}
              className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition"
            >
              →
            </button>
          </div>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleCards.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-6 border border-gray-200/60 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* TEXT */}
              <p className="text-gray-700 leading-relaxed mb-4">{t.text}</p>

              {/* FOOTER */}
              <div className="flex items-center gap-3 mt-4">
                <img
                  src={t.image}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={t.name}
                />
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex text-orange-400 text-sm mt-2">★★★★★</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
