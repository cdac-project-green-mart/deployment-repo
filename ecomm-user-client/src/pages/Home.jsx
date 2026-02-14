import FeaturedBrands from '../components/featuredBrands/FeaturedBrands'
import HeroSection from '../components/heroSection/HeroSection'
import HotDeals from '../components/hotDeals/HotDeals'
import InstagramFeed from '../components/instagram/InstagramFeed'
import LatestNews from '../components/latestNews/LatestNews'
import PopularCategories from '../components/popularCategories/PopularCategories'

import PopularProducts from '../components/popularProducts/PopularProducts'
import PromoSection from '../components/promoBanners/PromoSection'

import Testimonials from '../components/testimonials/Testimonials'

// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { getAllProducts, getCategories } from '../api/productApi';

// ... other imports

export default function Home() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const [popularRes, featuredRes] = await Promise.all([
          getAllProducts({ limit: 10 }),
          getAllProducts({ limit: 8 }),
        ]);

        setPopularProducts(popularRes.products ?? []);
        setFeaturedProducts(featuredRes.products ?? []);

        // Fetch categories for Popular Categories section
        try {
          const cats = await getCategories();
          if (Array.isArray(cats) && cats.length > 0) setApiCategories(cats);
        } catch { /* use hardcoded fallback */ }
      } catch (error) {
        console.error('Failed to load products:', error);
        setPopularProducts([]);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="relative px-4 md:px-10">
      <HeroSection />
      <PopularCategories apiCategories={apiCategories} />

      <PopularProducts products={popularProducts} loading={loading} />
      <PromoSection />
      <HotDeals products={featuredProducts ?? []} loading={loading} />

      <LatestNews />
      <Testimonials />
      <FeaturedBrands />
      <InstagramFeed />
    </div>
  );
}