import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import { WishlistProvider } from './context/WishlistContext';
import { BRAND } from './brandConfig';
import { Analytics } from '@vercel/analytics/react';
import { MessageCircle } from 'lucide-react';

function App() {
  const [whatsappNumber, setWhatsappNumber] = React.useState(BRAND.whatsapp);

  React.useEffect(() => {
    const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");
    fetch(`${API}/api/stats/config`)
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
      })
      .catch(err => console.error("Config fetch fail", err));
  }, []);

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <div className="app">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                {/* Category shortcut routes */}
                <Route path="/category/:cat" element={<Products />} />
              </Routes>
            </main>
            <Footer />
            <a href={`https://wa.me/${whatsappNumber}`} className="floating-whatsapp" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-2.32 0-4.518.953-6.19 2.684-1.673 1.73-2.593 4.032-2.59 6.482 0 2.53 1.027 4.891 2.825 6.634l-1.42 5.09 5.214-1.405c1.604.874 3.418 1.335 5.253 1.335h.005c2.322 0 4.519-.952 6.192-2.684 1.672-1.73 2.593-4.032-2.59-6.482 0-2.53-1.027-4.891-2.825-6.634-1.672-1.731-2.593-4.032-2.59-6.482zm.006 14.735c-1.587 0-3.146-.408-4.513-1.181l-.324-.184-3.101.835.85-3.032-.201-.32c-.854-1.362-1.306-2.936-1.306-4.555 0-4.514 3.674-8.188 8.188-8.188 2.186 0 4.241.851 5.79 2.398 1.547 1.545 2.4 3.602 2.4 5.79 0 4.513-3.674 8.188-8.188 8.2zm4.49-6.162c-.245-.123-1.454-.716-1.679-.798-.225-.082-.388-.123-.553.123-.165.245-.634.798-.778.962-.143.163-.286.184-.531.062-.245-.123-1.033-.381-1.967-1.215-.727-.648-1.218-1.448-1.362-1.693-.143-.245-.015-.378.107-.5.11-.11.245-.286.367-.43.123-.143.163-.245.245-.408.082-.163.041-.306-.02-.43-.062-.123-.553-1.33-.757-1.821-.2-.483-.404-.418-.553-.426-.143-.008-.306-.01-.47-.01-.163 0-.429.062-.654.306-.225.245-.858.838-.858 2.043 0 1.206.879 2.372.999 2.535.123.163 1.73 2.641 4.191 3.705.586.254 1.042.405 1.399.519.588.187 1.125.161 1.548.098.472-.07 1.454-.593 1.659-1.165.204-.572.204-1.063.143-1.165-.062-.102-.224-.163-.469-.286z" /></svg>
              <span>Chat with a Sneakerhead</span>
            </a>
          </div>
          <Analytics />
        </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
