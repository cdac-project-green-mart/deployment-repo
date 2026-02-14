// src/pages/ProductDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getAllProducts } from '../api/productApi';
import { getStock } from '../api/inventoryApi';
import { addToCart } from '../utils/cartUtils';
import ProductCard from '../components/popularProducts/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addMessage, setAddMessage] = useState(null);
  const [inventory, setInventory] = useState(null); // deployment-repo inventory service
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        const stock = await getStock(id);
        setInventory(stock);
      } catch {
        setInventory(null);
      }
    };
    load();
  }, [id]);

  // Fetch suggested products from the same category
  useEffect(() => {
    if (!product?.category) return;
    const loadSuggested = async () => {
      try {
        const res = await getAllProducts({ category: product.category, limit: 5 });
        const items = (res.products ?? []).filter(
          (p) => (p._id || p.id) !== id
        );
        setSuggested(items.slice(0, 4));
      } catch {
        setSuggested([]);
      }
    };
    loadSuggested();
  }, [product?.category, id]);

  const handleAddToCart = async () => {
    setAddMessage(null);
    const result = await addToCart(
      {
        _id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
      },
      quantity
    );

    if (result.success) {
      setAddedToCart(true);
      if (result.message) setAddMessage(result.message);
      setTimeout(() => {
        setAddedToCart(false);
        setAddMessage(null);
      }, 3000);
    } else if (result.message) {
      setAddMessage(result.message);
      setTimeout(() => setAddMessage(null), 3000);
    }
  };

  if (loading) return <div className="text-center py-20">Loading product...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image — centered container, no stretching */}
        <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100">
          <img
            src={product.images?.[0] || product.image || '/placeholder.jpg'}
            alt={product.name}
            className="max-w-full max-h-full object-contain p-4"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-green-600 font-bold mb-4">₹{product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="mb-4"><strong>Category:</strong> {product.category}</p>
          {/* Stock from deployment-repo inventory service */}
          {inventory !== null && (
            <p className={`mb-4 ${inventory.stock === 0 ? 'text-red-600 font-semibold' : ''}`}>
              <strong>Stock:</strong>{' '}
              {inventory.stock === 0 ? 'Out of stock' : `${inventory.stock} available`}
            </p>
          )}

          {/* Quantity Selector */}
          <div className="mb-6 flex items-center gap-4">
            <label className="font-medium">Quantity:</label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(inventory ? inventory.stock : Infinity, q + 1))}
                className="px-4 py-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                disabled={inventory !== null && quantity >= inventory.stock}
              >
                +
              </button>
            </div>
            {inventory && inventory.stock > 0 && (
              <span className="text-sm text-gray-500">(max {inventory.stock})</span>
            )}
          </div>

          {addMessage && (
            <p className={`mb-4 text-sm ${addMessage.includes('Only') ? 'text-amber-600' : 'text-red-600'}`}>
              {addMessage}
            </p>
          )}

          {/* Add to Cart Button */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={inventory !== null && inventory.stock === 0}
              className={`px-8 py-3 rounded-lg font-medium transition ${addedToCart
                ? 'bg-green-700 text-white'
                : inventory !== null && inventory.stock === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {inventory !== null && inventory.stock === 0
                ? 'Out of stock'
                : addedToCart
                  ? '✓ Added to Cart!'
                  : 'Add to Cart'}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Products */}
      {suggested.length > 0 && (
        <div className="mt-14 pt-10 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">You may also like</h2>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-green-600 font-medium hover:underline text-sm"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggested.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  _id={p._id || p.id}
                  image={p.images?.[0] || p.image}
                  title={p.name}
                  price={p.price}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}