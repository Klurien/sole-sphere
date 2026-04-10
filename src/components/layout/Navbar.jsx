import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, LayoutDashboard, Menu, X, Phone, Zap, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../brandConfig';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setMobileMenuOpen(false);
        }
    };

    const categories = [
        { name: 'Collection', path: '/products' },
        { name: 'New Drops', path: '/products?sort=newest' },
        { name: 'Lifestyle', path: '/products?category=Lifestyle' },
        { name: 'Basketball', path: '/products?category=Basketball' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <div className="announcement-bar">
                <div className="announcement-track">
                    <span>⚡ USE CODE 'SOLE25' FOR 25% OFF YOUR FIRST ORDER!</span>
                    <span>👟 EXCLUSIVE DROPS HAPPENING NOW</span>
                    <span>📦 WORLDWIDE SHIPPING | FAST DELIVERY</span>
                    <span>⚡ USE CODE 'SOLE25' FOR 25% OFF YOUR FIRST ORDER!</span>
                </div>
            </div>

            <header className={`navbar-ks ${isScrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <button className="v3-mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>

                    <Link to="/" className="navbar-logo">
                        <span>SOLESPHERE</span>
                    </Link>

                    <nav className="navbar-links desktop-only">
                        {categories.map((cat, idx) => (
                            <Link
                                key={idx}
                                to={cat.path}
                                className={`nav-link ${location.pathname === cat.path ? 'active' : ''}`}
                            >
                                {cat.name}
                                {cat.name === 'New Drops' && <span className="cat-badge">HOT</span>}
                            </Link>
                        ))}
                    </nav>

                    <div className="navbar-actions">
                        <button className="nav-action-icon search-trigger desktop-only">
                            <Search size={20} />
                        </button>

                        <Link to="/profile" className="nav-action-icon">
                            <User size={20} />
                        </Link>

                        <Link to="/products" className="nav-action-icon">
                            <Zap size={20} />
                        </Link>
                        
                        <Link to="/cart" className="cart-icon nav-action-icon">
                            <ShoppingBag size={20} />
                            <span className="cart-count">0</span>
                        </Link>
                    </div>
                </div>

                <div className={`mobile-nav-ks ${mobileMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-nav-header">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>SOLESPHERE</Link>
                        <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
                    </div>
                    <div className="mobile-links-ks">
                        {categories.map((cat, idx) => (
                            <Link key={idx} to={cat.path} onClick={() => setMobileMenuOpen(false)}>
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;

