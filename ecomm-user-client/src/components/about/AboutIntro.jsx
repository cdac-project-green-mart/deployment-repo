import React from 'react'
import aboutIntro from '../../assets/aboutIntro.svg'

export default function AboutIntro() {
  return (
    <section className="pt-18 pb-18 bg-white">
      <div className="mx-auto max-w-[1364px] px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT TEXT */}
        <div className="max-w-[607px]">
          <h2 className="text-[56px] font-semibold leading-[1.2] text-[#1A1A1A] mb-6">
            100% Trusted
            <br />
            Organic Food Store
          </h2>

          <p className="text-[18px] font-normal leading-[1.5] text-[#666666] max-w-[590px]">
            We are committed to delivering fresh, organic, and sustainably sourced food straight
            from local farms to your home. Our mission is to support healthy living while nurturing
            a cleaner and greener environment.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-end">
          <img
            src={aboutIntro}
            alt="About Farmer"
            className="w-[716px] h-[492px] rounded-[8px] object-cover"
          />
        </div>
      </div>
    </section>
  )
}
