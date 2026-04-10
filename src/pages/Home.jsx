import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import CardSkeleton from '../components/product/CardSkeleton';
import { BRAND } from '../brandConfig';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");
        fetch(`${API_URL}/api/products?limit=8&sort=newest`)
            .then(res => res.json())
            .then(data => {
                setFeaturedProducts(data.products || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="home-v3">
            <Helmet>
                <title>Sole Sphere | Premium Authentic Sneakers Kenya</title>
                <meta name="description" content="Shop the most exclusive, authentic sneakers in Kenya. Nike, Jordan, Adidas and more." />
            </Helmet>

            <section className="hero-v3">
                <div className="container hero-v3-inner">
                    <motion.div 
                        className="hero-v3-content"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="v3-sub">NEW SEASON 2024</span>
                        <h1>STEP INTO <br/><span className="accent">AUTHENTICITY</span></h1>
                        <p className="hero-v3-desc">Discover curated drops from the world's most iconic silhouettes.</p>
                        <div className="hero-v3-actions">
                            <Link to="/products" className="h-action-btn-ks">
                                SHOP COLLECTION <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <div className="hero-v3-image">
                    <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop" alt="Sneakers" />
                </div>
            </section>

            <section className="trust-bar-v3">
                <div className="container trust-flex-v3">
                    <div className="trust-item-v3">
                        <strong>100%</strong>
                        <span>AUTHENTIC</span>
                    </div>
                    <div className="trust-item-v3">
                        <strong>5000+</strong>
                        <span>PAIRS SOLD</span>
                    </div>
                    <div className="trust-item-v3">
                        <strong>24/7</strong>
                        <span>SUPPORT</span>
                    </div>
                    <div className="trust-item-v3">
                        <strong>FAST</strong>
                        <span>DELIVERY</span>
                    </div>
                </div>
            </section>

            <section className="container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">NEW RELEASES</h2>
                        <span className="section-subtitle">THE LATEST PULSE OF SNEAKER CULTURE</span>
                    </div>
                    <Link to="/products" className="view-all-link">EXPLORE ALL</Link>
                </div>
                <div className="v3-collection-grid">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        featuredProducts.map(shoe => (
                            <ProductCard key={shoe.id} product={shoe} />
                        ))
                    )}
                </div>
            </section>

            <section className="brand-grid-v3">
                <div className="container brands-flex-v3">
                    <div className="brand-logo-v3">NIKE</div>
                    <div className="brand-logo-v3">JORDAN</div>
                    <div className="brand-logo-v3">ADIDAS</div>
                    <div className="brand-logo-v3">YEEZY</div>
                    <div className="brand-logo-v3">PUMA</div>
                </div>
            </section>

            <section className="container collections-promo-v3">
                <div className="collections-grid-v3">
                    <Link to="/products?category=Basketball" className="col-card-v3">
                        <h3>ON COURT</h3>
                        <p>High Performance Silhouettes</p>
                        <span className="col-link">VIEW SERIES</span>
                    </Link>
                    <Link to="/products?category=Lifestyle" className="col-card-v3">
                        <h3>LIFESTYLE</h3>
                        <p>Essential Daily Rotation</p>
                        <span className="col-link">VIEW ALL</span>
                    </Link>
                </div>
            </section>

            <section className="social-v3">
                <div className="container">
                    <Instagram size={40} />
                    <h3>JOIN THE SQUAD</h3>
                    <p>Follow us for exclusive early access and stock alerts.</p>
                    <a href={`https://instagram.com/solesphere_ke`} className="btn-v3-social">@SOLESPHERE_KE</a>
                </div>
            </section>
        </div>
    );
};

export default Home;
