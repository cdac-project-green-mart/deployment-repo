import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Products from '../pages/Products.jsx'
import ProductDetails from '../pages/ProductDetails.jsx'
import Cart from '../pages/Cart.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Checkout from '../pages/Checkout.jsx'
import Orders from '../pages/Orders.jsx'
import OrderDetails from '../pages/OrderDetails.jsx'
import Account from '../pages/Account.jsx'
import About from '../pages/About.jsx'
import Contact from '../pages/Contact.jsx'
import FAQ from '../pages/FAQ.jsx'
import TermsAndConditions from '../pages/TermsAndConditions.jsx'
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx'
import Layout from '../components/layout/Layout.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="account" element={<Account />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="terms" element={<TermsAndConditions />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
