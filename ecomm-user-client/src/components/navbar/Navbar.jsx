import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../../index.css'
import GreenMartLogo from '../greenMartLogo/GreenMartLogo'
import CartPopup from '../cartPopup/CartPopup'
import { getCartItems, getCartTotalItems, isLoggedIn, logout } from '../../utils/cartUtils'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [openMenu, setOpenMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  // Sync search input with URL q param when on /products
  useEffect(() => {
    if (location.pathname === '/products') {
      const params = new URLSearchParams(location.search)
      const q = params.get('q') || ''
      setSearchQuery(q)
    }
  }, [location.pathname, location.search])

  // Sync logged-in state on auth changes
  useEffect(() => {
    const onAuthChanged = () => setLoggedIn(isLoggedIn())
    window.addEventListener('authChanged', onAuthChanged)
    return () => window.removeEventListener('authChanged', onAuthChanged)
  }, [])

  const navbarRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  const [cartTotal, setCartTotal] = useState(0)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Load cart total and item count
  useEffect(() => {
    const updateCartInfo = () => {
      const cartItems = getCartItems()
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const count = getCartTotalItems()
      setCartTotal(total)
      setCartItemCount(count)
    }

    updateCartInfo()

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartInfo)

    return () => {
      window.removeEventListener('cartUpdated', updateCartInfo)
    }
  }, [])

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const handleMouseEnter = (menu) => {
    clearTimeout(hoverTimeoutRef.current)
    setOpenMenu(menu)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null)
    }, 200)
  }

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    setMobileOpen(false)
    setOpenMenu(null)
    navigate('/')
    window.dispatchEvent(new CustomEvent('authChanged'))
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartOpen) return
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cartOpen])

  return (
    <>
      <div className="w-full" ref={navbarRef}>
        {/* TOP NAV BAR */}
        <nav className="w-full bg-white px-6 md:px-12 py-4 flex items-center justify-between shadow-sm">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <GreenMartLogo />
            <Link to="/" className="text-2xl font-poppins font-bold">
              Ecobazar
            </Link>
          </div>

          {/* SEARCH BAR (Desktop) */}
          <div className="hidden md:flex flex-1 px-10">
            <form
              className="relative max-w-xl mx-auto w-full"
              onSubmit={(e) => {
                e.preventDefault()
                const q = searchQuery?.trim()
                if (q) navigate(`/products?q=${encodeURIComponent(q)}`)
                else navigate('/products')
              }}
            >
              <input
                type="text"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none"
              />
              <button type="submit" className="absolute right-1 top-1 bg-green-600 text-white px-4 py-1.5 rounded-md text-sm">
                Search
              </button>
            </form>
          </div>

          {/* RIGHT ICONS */}
          <div className="hidden md:flex items-center gap-8">
            {/* Like */}
            <svg className="h-6 w-6" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>

            {/* Cart Button */}
            <div
              className="flex items-center gap-2 cursor-pointer relative"
              onClick={() => setCartOpen(true)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="black"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9"
                />
              </svg>

              {/* Cart Badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}

              <div className="text-sm leading-4">
                <p className="text-gray-500">Shopping cart:</p>
                <p className="font-semibold">₹{cartTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Auth Buttons (Desktop) */}
            {loggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/account" className="text-sm text-green-600 font-medium hover:underline">
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm hover:text-green-600">
                  Log In
                </Link>
                <Link to="/register" className="text-sm hover:text-green-600">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE ICONS */}
          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Cart Button */}
            <div
              className="relative cursor-pointer"
              onClick={() => setCartOpen(true)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="black"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </div>
            {/* Mobile Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-7 h-7" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-[600px] py-4' : 'max-h-0'
            }`}
        >
          {/* Mobile Search */}
          <form
            className="px-6 pb-4"
            onSubmit={(e) => {
              e.preventDefault()
              const q = searchQuery?.trim()
              if (q) navigate(`/products?q=${encodeURIComponent(q)}`)
              else navigate('/products')
              setMobileOpen(false)
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">
                Search
              </button>
            </div>
          </form>
          <ul className="flex flex-col gap-3 px-6 text-base">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <li className="cursor-pointer">Home</li>
            </Link>

            {/* SHOP */}
            <li>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleMenu('shop')}
              >
                <span>Shop</span>
                <span className={`${openMenu === 'shop' ? 'rotate-180' : ''} transition-transform`}>
                  ▼
                </span>
              </div>

              {openMenu === 'shop' && (
                <div className="ml-4 mt-2 flex flex-col gap-2 dropdown">
                  <Link to="/products" onClick={() => { setMobileOpen(false); setOpenMenu(null); }}>
                    <p className="cursor-pointer">Products</p>
                  </Link>
                </div>
              )}
            </li>

            {/* PAGES */}
            <li>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleMenu('pages')}
              >
                <span>Pages</span>
                <span
                  className={`${openMenu === 'pages' ? 'rotate-180' : ''} transition-transform`}
                >
                  ▼
                </span>
              </div>

              {openMenu === 'pages' && (
                <div className="ml-4 mt-2 flex flex-col gap-2 dropdown">
                  <p className="cursor-pointer">FAQ</p>
                  <p className="cursor-pointer">Terms</p>
                </div>
              )}
            </li>

            {/* BLOG */}
            <li>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleMenu('blog')}
              >
                <span>Blog</span>
                <span className={`${openMenu === 'blog' ? 'rotate-180' : ''} transition-transform`}>
                  ▼
                </span>
              </div>

              {openMenu === 'blog' && (
                <div className="ml-4 mt-2 flex flex-col gap-2 dropdown">
                  <p className="cursor-pointer">Blog List</p>
                  <p className="cursor-pointer">Single Post</p>
                </div>
              )}
            </li>

            <Link to="/about" onClick={() => setMobileOpen(false)}>
              <li className="cursor-pointer">About Us</li>
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              <li className="cursor-pointer">Contact Us</li>
            </Link>
            {loggedIn ? (
              <>
                <Link to="/account" onClick={() => setMobileOpen(false)}>
                  <li className="cursor-pointer text-green-600 font-medium">My Account</li>
                </Link>
                <li
                  role="button"
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 font-medium"
                >
                  Logout
                </li>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <li className="cursor-pointer">Log In</li>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <li className="cursor-pointer">Register</li>
                </Link>
              </>
            )}
          </ul>
        </div>

        {/* DESKTOP DROPDOWN NAV */}
        <div className="hidden md:block w-full bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-10 px-12 py-4 relative font-poppins text-2xl font-medium">
            <ul className="flex items-center gap-8 text-sm">
              <Link to="/">
                <li className="hover:text-green-600 cursor-pointer">Home</li>
              </Link>

              {/* SHOP */}
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter('shop')}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                  onClick={() => toggleMenu('shop')}
                >
                  Shop
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {openMenu === 'shop' && (
                  <div className="absolute bg-white border shadow-md w-40 mt-2 rounded text-sm z-20 dropdown">
                    <Link to="/products" onClick={() => setOpenMenu(null)}>
                      <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Products</p>
                    </Link>
                  </div>
                )}
              </li>

              {/* PAGES */}
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter('pages')}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                  onClick={() => toggleMenu('pages')}
                >
                  Pages
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {openMenu === 'pages' && (
                  <div className="absolute bg-white border shadow-md w-40 mt-2 rounded text-sm z-20 dropdown">
                    <Link to="/cart">
                      <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Cart</p>
                    </Link>
                    <Link to="/orders">
                      <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Orders</p>
                    </Link>
                    <Link to="/login">
                      <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Log In</p>
                    </Link>
                    <Link to="/register">
                      <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Register</p>
                    </Link>
                  </div>
                )}
              </li>

              {/* BLOG */}
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter('blog')}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-green-600"
                  onClick={() => toggleMenu('blog')}
                >
                  Blog
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {openMenu === 'blog' && (
                  <div className="absolute bg-white border shadow-md w-40 mt-2 rounded text-sm z-20 dropdown">
                    <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Blog List</p>
                    <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Single Post</p>
                  </div>
                )}
              </li>

              <Link to="/about">
                <li className="hover:text-green-600 cursor-pointer">About Us</li>
              </Link>
              <Link to="/contact">
                <li className="hover:text-green-600 cursor-pointer">Contact Us</li>
              </Link>
            </ul>
          </div>
        </div>
      </div>

      {/* CART POPUP */}
      <CartPopup open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default Navbar
