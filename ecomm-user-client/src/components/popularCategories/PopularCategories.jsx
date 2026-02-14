import React from 'react'
import { Link } from 'react-router-dom'
import CategoryCard from './CategoryCard'

import freshFruit from '../../assets/fresh-fruit.png'
import freshVeg from '../../assets/fresh-veg.png'
import meatFish from '../../assets/meat-fish.png'
import snacks from '../../assets/snacks.png'
import beverages from '../../assets/beverages.png'
import beauty from '../../assets/beauty.png'
import bakery from '../../assets/bakery.png'
import baking from '../../assets/baking.png'
import cooking from '../../assets/cooking.png'
import diabetic from '../../assets/diabetic.png'
import detergents from '../../assets/detergents.png'
import oil from '../../assets/oil.png'

export default function PopularCategories({ apiCategories = [] }) {
  const hardcoded = [
    { image: freshFruit, title: 'Fresh Fruit', category: 'Fruits' },
    { image: freshVeg, title: 'Fresh Vegetables', category: 'Vegetables' },
    { image: meatFish, title: 'Meat & Fish', category: 'Meat & Fish' },
    { image: snacks, title: 'Snacks', category: 'Snacks' },
    { image: beverages, title: 'Beverages', category: 'Beverages' },
    { image: beauty, title: 'Beauty & Health', category: 'Beauty & Health' },
    { image: bakery, title: 'Bread & Bakery', category: 'Bread & Bakery' },
    { image: baking, title: 'Baking Needs', category: 'Baking Needs' },
    { image: cooking, title: 'Cooking', category: 'Cooking' },
    { image: diabetic, title: 'Diabetic Food', category: 'Diabetic Food' },
    { image: detergents, title: 'Dish Detergents', category: 'Dish Detergents' },
    { image: oil, title: 'Oil', category: 'Oil' },
  ]

  // Merge API categories (add any new ones that aren't already in the hardcoded list)
  const hardcodedNames = new Set(hardcoded.map((c) => c.category.toLowerCase()))
  const extra = apiCategories
    .filter((c) => !hardcodedNames.has((c.name ?? c).toLowerCase()))
    .map((c) => ({
      image: null,
      title: typeof c === 'string' ? c : c.name ?? c,
      category: typeof c === 'string' ? c : c.name ?? c,
    }))

  const categories = [...hardcoded, ...extra]

  return (
    <div className="my-10 w-full flex justify-center font-[poppins]">
      <div className="w-full max-w-[1320px] px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-semibold">Popular Categories</h2>
          <Link to="/products" className="text-green-600 font-medium hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <CategoryCard
              key={idx}
              image={cat.image}
              title={cat.title}
              category={cat.category}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
