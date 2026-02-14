import React from "react";

export default function TestimonialCard({ text, name, role, image }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      {/* Quote Icon */}
      <div className="text-green-500 text-4xl mb-3">“</div>

      {/* Testimonial Text */}
      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        {text}
      </p>
      
      {/* Footer */}
      <div className="flex items-center gap-3">
        <img
          src={image}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{role}</p>
        </div>

        {/* Star Rating */}
        <div className="ml-auto text-orange-400 text-xs">
          {"★".repeat(5)}
        </div>
      </div>
    </div>
  );
}
