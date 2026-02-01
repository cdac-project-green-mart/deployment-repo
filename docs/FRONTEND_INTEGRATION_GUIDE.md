# Frontend Integration Guide

A practical guide for frontend developers to integrate with the Green Mart backend.

---

## Quick Start

### 1. Base Configuration

```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:8080'; // API Gateway

export const api = {
  auth: `${API_BASE_URL}/api/auth`,
  products: `${API_BASE_URL}/api/products`,
  orders: `${API_BASE_URL}/api/orders`,
  checkout: `${API_BASE_URL}/api/checkout`,
  payments: `${API_BASE_URL}/api/payments`,
  inventory: `${API_BASE_URL}/api/inventory`,
};
```

### 2. HTTP Client Setup

```javascript
// utils/httpClient.js
import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add user ID for protected routes
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  
  return config;
});

// Handle auth errors
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
```

---

## Authentication Flow

### Register New User

```javascript
async function register(userData) {
  try {
    const response = await httpClient.post('/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'CUSTOMER' // or 'VENDOR'
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}
```

### Login

```javascript
async function login(email, password) {
  const response = await httpClient.post('/api/auth/login', {
    email,
    password
  });
  
  if (response.data.success) {
    const { token, data: user } = response.data;
    
    // Store credentials
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userRole', user.role);
    
    return user;
  }
  
  throw new Error('Login failed');
}
```

### Logout

```javascript
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  window.location.href = '/login';
}
```

### Check Auth State

```javascript
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  return {
    id: localStorage.getItem('userId'),
    role: localStorage.getItem('userRole'),
  };
}
```

---

## Common User Journeys

### 1. Browse Products

```javascript
// Get all products
async function getProducts(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await httpClient.get(`/api/products?${params}`);
  return response.data.data;
}

// Get single product
async function getProduct(productId) {
  const response = await httpClient.get(`/api/products/${productId}`);
  return response.data.data;
}

// Usage
const products = await getProducts({ category: 'Electronics', page: 1 });
const product = await getProduct('product-id-here');
```

### 2. Shopping Cart

```javascript
// Get cart
async function getCart() {
  const response = await httpClient.get('/api/orders/cart');
  return response.data.data;
}

// Add to cart
async function addToCart(product, quantity = 1) {
  const response = await httpClient.post('/api/orders/cart/add', {
    productId: product._id,
    name: product.name,
    quantity,
    price: product.price
  });
  return response.data.data;
}

// Update quantity
async function updateCartItem(productId, quantity) {
  const response = await httpClient.put(
    `/api/orders/cart/update?productId=${productId}&quantity=${quantity}`
  );
  return response.data.data;
}

// Remove from cart
async function removeFromCart(productId) {
  const response = await httpClient.delete(
    `/api/orders/cart/remove?productId=${productId}`
  );
  return response.data.data;
}
```

### 3. Checkout Process

```javascript
async function checkout(shippingAddress, paymentMethod) {
  try {
    const response = await httpClient.post('/api/checkout', {
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        zip: shippingAddress.zip,
        country: shippingAddress.country
      },
      paymentMethod: paymentMethod // 'CREDIT_CARD', 'DEBIT_CARD', etc.
    });
    
    if (response.data.success) {
      return {
        orderId: response.data.data.orderId,
        transactionId: response.data.data.transactionId,
        status: 'success'
      };
    }
  } catch (error) {
    if (error.response?.status === 409) {
      // Insufficient stock
      throw new Error('Some items are out of stock');
    }
    if (error.response?.status === 402) {
      // Payment failed
      throw new Error('Payment failed. Please try again.');
    }
    throw error;
  }
}
```

### 4. Order History

```javascript
// Get all orders
async function getOrders() {
  const response = await httpClient.get('/api/orders');
  return response.data.data;
}

// Get single order
async function getOrder(orderId) {
  const response = await httpClient.get(`/api/orders/${orderId}`);
  return response.data.data;
}
```

---

## Error Handling

### Standard Error Handler

```javascript
function handleApiError(error) {
  if (!error.response) {
    // Network error
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your internet connection.'
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return {
        type: 'VALIDATION_ERROR',
        message: data.message || 'Invalid request'
      };
    case 401:
      return {
        type: 'AUTH_ERROR',
        message: 'Please log in to continue'
      };
    case 403:
      return {
        type: 'FORBIDDEN',
        message: 'You do not have permission to perform this action'
      };
    case 404:
      return {
        type: 'NOT_FOUND',
        message: data.message || 'Resource not found'
      };
    case 409:
      return {
        type: 'CONFLICT',
        message: data.message || 'Conflict occurred'
      };
    case 429:
      return {
        type: 'RATE_LIMIT',
        message: 'Too many requests. Please wait a moment.'
      };
    default:
      return {
        type: 'SERVER_ERROR',
        message: 'An unexpected error occurred'
      };
  }
}
```

### Usage with React

```jsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ProductGrid products={products} />;
}
```

---

## Role-Based UI

```javascript
// Check user role for UI rendering
function hasPermission(requiredRole) {
  const userRole = localStorage.getItem('userRole');
  
  const roleHierarchy = {
    'ADMIN': 3,
    'VENDOR': 2,
    'CUSTOMER': 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Usage in React
function AdminPanel() {
  if (!hasPermission('ADMIN')) {
    return <AccessDenied />;
  }
  
  return <AdminDashboard />;
}

// Conditional rendering
function ProductCard({ product }) {
  const isVendor = hasPermission('VENDOR');
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      {isVendor && <EditButton productId={product._id} />}
    </div>
  );
}
```

---

## Environment Configuration

```javascript
// .env.development
REACT_APP_API_URL=http://localhost:8080

// .env.production
REACT_APP_API_URL=https://api.greenmart.com

// Usage
const API_URL = process.env.REACT_APP_API_URL;
```

---

## Checklist for Frontend Developers

- [ ] Set up HTTP client with interceptors
- [ ] Implement token storage (localStorage/cookies)
- [ ] Handle 401 errors globally (auto-logout)
- [ ] Implement loading states for API calls
- [ ] Handle network errors gracefully
- [ ] Implement role-based UI components
- [ ] Set up environment variables for API URLs
- [ ] Test checkout flow end-to-end
