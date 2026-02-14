import React from 'react'
import aboutImage from '../../assets/farmer-image.png'

export default function AboutFeatures() {
  const features = [
    {
      title: '100% Organic food',
      desc: '100% healthy & Fresh food.',
      icon: '🌱',
    },
    {
      title: 'Great Support 24/7',
      desc: 'Instant access to Contact',
      icon: '🎧',
    },
    {
      title: 'Customer Feedback',
      desc: 'Our happy customer',
      icon: '⭐',
    },
    {
      title: '100% Secure Payment',
      desc: 'We ensure your money is safe',
      icon: '💳',
    },
  ]

  return (
    <section className="bg-[#FAFAFA] p-0 m-0 w-full">

      <div className="grid grid-cols-1 md:grid-cols-2 w-full">

        {/* LEFT IMAGE - flush to the left */}
        <div className="w-full h-full">
          <img src={aboutImage} alt="About Features" className="w-full h-full object-cover" />
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex items-center py-12 px-6 lg:px-12">
          <div className="max-w-[560px] mx-auto">

            <h2 className="text-[48px] lg:text-[56px] font-semibold leading-tight text-[#002603] mb-6">
              100% Trusted <br /> Organic Food Store
            </h2>

            <p className="text-[#4A4A4A] mb-8">
              At our organic food store, we believe healthy living begins with clean and natural
              ingredients. That’s why we work closely with certified farmers who grow produce
              without pesticides, chemicals, or artificial enhancers. Every product we offer is
              hand-picked for freshness, nutritional value, and authentic farm-to-table taste. Your
              wellness is our priority, and we proudly ensure transparency, quality, and
              sustainability in everything we deliver.
            </p>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {features.map((f, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-2xl">
                    {f.icon}
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#002603]">{f.title}</h4>
                    <p className="text-sm text-[#4A4A4A]">{f.desc}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
