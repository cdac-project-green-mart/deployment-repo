import React from 'react'
import LeftHeroBanner from '../leftBanner/LeftBanner'
import SideOffers from '../sideOffers/SideOffers'
import FeatureBar from '../featureBar/FeatureBar'

export default function HeroSection() {
  return (
    <div className="w-full mt-8 mb-12 flex justify-center font-[poppins]">
      <div className="w-full max-w-[1320px] px-4">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeftHeroBanner />
          </div>

          <div className="lg:col-span-1 w-full">
            <SideOffers />
          </div>
        </div>

        {/* FEATURE BAR */}
        <div className="mt-8">
          <FeatureBar />
        </div>
      </div>
    </div>
  )
}
