import React from 'react'
import NewsCard from './NewsCard'

import news1 from '../../assets/news/news1.jpg'
import news2 from '../../assets/news/news2.jpg'
import news3 from '../../assets/news/news3.jpg'

export default function LatestNews() {
  const newsList = [
    {
      image: news1,
      day: '18',
      month: 'NOV',
      title: 'Why Citrus Fruits Are the Freshest Way to Boost Your Immunity This Season.',
    },
    {
      image: news2,
      day: '29',
      month: 'JAN',
      title: 'A Simple Protein-Packed Breakfast Bowl to Kickstart Your Mornings.',
    },
    {
      image: news3,
      day: '21',
      month: 'FEB',
      title: 'Colorful Veggie Bowls: The Secret to Eating Healthy Without Getting Bored.',
    },
  ]

  return (
    <div className="w-full flex justify-center mt-16 mb-16">
      <div className="w-full max-w-[1320px] px-4">
        {/* TITLE */}
        <h2 className="text-center text-2xl font-bold mb-10">Latest News</h2>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.map((item, i) => (
            <NewsCard key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}
