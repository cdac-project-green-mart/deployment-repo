import React from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

// import apple from '../../assets/products/apple.jpg'
// import orange from '../../assets/products/orange.jpg'
// import cabbage from '../../assets/products/cabbage.jpg'
// import lettuce from '../../assets/products/lettuce.jpg'
// import eggplant from '../../assets/products/eggplant.jpg'
// import potatoes from '../../assets/products/potatoes.jpg'
// import corn from '../../assets/products/corn.jpg'
// import cauliflower from '../../assets/products/cauliflower.jpg'
// import capsicum from '../../assets/products/capsicum.jpg'
// import chili from '../../assets/products/chili.jpg'

// src/components/popularProducts/PopularProducts.jsx
export default function PopularProducts({ products = [], loading }) {
  if (loading) {
    return <div className="text-center py-20 text-xl">Loading popular products...</div>;
  }

  return (
    <div className="my-12 w-full flex justify-center font-[poppins]">
      <div className="w-full max-w-[1320px] px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-semibold">Popular Products</h2>
          <Link to="/products" className="text-green-600 font-medium hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {products.map((product) => (
            <ProductCard
                          key={product.id ?? product._id}              
                          _id={product.id ?? product._id}               
                          image={product.images?.[0] || '/placeholder.jpg'}
                          title={product.name}
                          price={product.price}
                          oldPrice={product.originalPrice}
                          rating={product.rating || 4}
                          sale={product.discount ? `Sale ${product.discount}%` : null}
                          selected={false}                
                        />
          ))}
        </div>
      </div>
    </div>
  );
}