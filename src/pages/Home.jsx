import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Zap, ShoppingBag, Search, Globe, ArrowRight, Instagram, Star, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import CardSkeleton from '../components/product/CardSkeleton';
import { BRAND } from '../brandConfig';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Quick search state
    const [searchBrand, setSearchBrand] = useState('All');

    // Scroll parallax
    const { scrollY } = useScroll();
    const yHeroBg = useTransform(scrollY, [0, 1000], [0, 400]);
    const opacityHeroContent = useTransform(scrollY, [0, 600], [1, 0]);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");
        fetch(`${API_URL}/api/products?limit=6&sort=newest`)
            .then(res => res.json())
            .then(data => {
                if (data.products) {
                    setFeaturedProducts(data.products.slice(0, 6));
                } else if (Array.isArray(data)) {
                    setFeaturedProducts(data.slice(0, 6));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="home-v3">
            <Helmet>
                <title>Sole Sphere | Premium Authentic Sneakers & Streetwear</title>
                <meta name="description" content="Discover exclusive, authentic sneakers and luxury streetwear at Sole Sphere. Shop the latest drops from Nike, Jordan, Adidas, and more." />
            </Helmet>

            {/* ── Hero ── */}
            <section className="hero-v3">
                <div className="container hero-v3-inner">
                    <motion.div
                        className="hero-v3-content"
                        style={{ opacity: opacityHeroContent }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                    >
                        <div className="hero-v3-badge">
                            <span className="badge-dot"></span>
                            Est. 2024 · Authenticity Guaranteed
                        </div>
                        <h1 className="gradient-text">
                            Defy the<br />
                            <span className="accent">Ordinary.</span>
                        </h1>
                        <p className="hero-v3-desc">
                            Exclusive silhouettes. Premium materials. Hand-picked drops that define the culture. Step into the elite circle of sneaker excellence.
                        </p>
                        <div className="hero-v3-actions">
                             <Link to="/products" className="primary-btn hero-btn">
                                Explore Drops <ArrowRight size={17} />
                             </Link>
                             <a href={`https://wa.me/${BRAND.whatsapp}`} className="glass-btn secondary-hero-btn">
                                Limited Releases <Zap size={15} />
                             </a>
                        </div>
                    </motion.div>
                </div>

                <motion.div className="hero-v3-image" style={{ y: yHeroBg }}>
                     <img 
                         src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop" 
                         alt="Premium Sneakers" 
                     />
                    <div className="hero-v3-overlay"></div>
                </motion.div>

                <div className="hero-scroll">
                    <div className="hero-scroll-line"></div>
                    <span>Scroll</span>
                </div>
            </section>

            {/* ── Trust Bar ── */}
            <section className="trust-bar-v3">
                <div className="container trust-flex-v3">
                     {[
                        { num: '5000+', desc: 'Pairs Delivered' },
                        { num: '100%', desc: 'Authenticity Proof' },
                        { num: '4.9/5', desc: 'Sneakerhead Rating' },
                        { num: '24/7', desc: 'Expert Support' }
                    ].map((item, idx) => (
                        <motion.div 
                            className="trust-item-v3" key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                            viewport={{ once: true, margin: '-50px' }}
                        >
                            <strong>{item.num}</strong>
                            <span>{item.desc}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Category Strip ── */}
            <section className="category-strip">
                <div className="container">
                     <div className="category-strip-inner">
                        <Link to="/products" className="cat-pill active">All Drops</Link>
                        <Link to="/products?category=Lifestyle" className="cat-pill">Lifestyle</Link>
                        <Link to="/products?category=Basketball" className="cat-pill">Basketball</Link>
                        <Link to="/products?category=Running" className="cat-pill">Running</Link>
                        <Link to="/products?category=Streetwear" className="cat-pill">Streetwear</Link>
                        <Link to="/products?category=Limited+Edition" className="cat-pill">Limited Edition</Link>
                    </div>
                </div>
            </section>

            {/* ── Brand Grid ── */}
            <section className="brand-grid-v3">
                <div className="container">
                     <div className="section-header-v3 centered">
                        <span className="v3-sub">Elite Silhouettes</span>
                        <h2>TRUSTED <span className="accent">BRANDS</span></h2>
                    </div>
                    <div className="brands-flex-v3">
                        <div className="brand-logo-v3" title="Nike">Nike</div>
                        <div className="brand-logo-v3" title="Jordan">Jordan</div>
                        <div className="brand-logo-v3" title="Adidas">Adidas</div>
                        <div className="brand-logo-v3" title="New Balance">New Balance</div>
                        <div className="brand-logo-v3" title="Yeezy">Yeezy</div>
                        <div className="brand-logo-v3" title="Puma">Puma</div>
                        <div className="brand-logo-v3" title="Reebok">Reebok</div>
                    </div>
                </div>
            </section>

            {/* ── Featured Collection ── */}
            <section className="collection-v3 container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">New Drops</h2>
                        <p className="section-subtitle">The latest additions to our exclusive collection</p>
                    </div>
                    <Link to="/products" className="view-all-link">
                        View All Collections <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="v3-collection-grid">
                    {loading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        featuredProducts.map((shoe, idx) => (
                            <motion.div
                                key={shoe.id}
                                initial={{ opacity: 0, y: 36 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
                                viewport={{ once: true }}
                            >
                             <ProductCard product={shoe} />
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* ── Featured Collections ── */}
            <section className="collections-promo-v3">
                <div className="container">
                     <div className="collections-grid-v3">
                        <Link to="/products?category=Basketball" className="col-card-v3 glass-panel">
                            <div className="col-card-bg court-bg"></div>
                            <div className="col-card-content">
                                <h3>On the Court</h3>
                                <p>High-performance basketball silhouettes.</p>
                                <span className="col-link">View Series <ChevronRight size={14} /></span>
                            </div>
                        </Link>
                        <Link to="/products?category=Limited+Edition" className="col-card-v3 glass-panel">
                            <div className="col-card-bg hype-bg"></div>
                            <div className="col-card-content">
                                <h3>Hype & Rare</h3>
                                <p>Exclusive limited-run masterpieces.</p>
                                <span className="col-link">Explore Rarities <ChevronRight size={14} /></span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Elite Testimonials ── */}
            <section className="testimonials-v3">
                <div className="container">
                    <div className="section-header-v3 centered">
                        <span className="v3-sub">Client Stories</span>
                        <h2>VOICES OF <span className="accent">EXCELLENCE</span></h2>
                    </div>
                     <div className="testimonials-grid-v3">
                        <div className="testimonial-card-v3 glass-panel">
                            <p className="testo-quote">"The verification process is top-notch. My Jordan 4s arrived with all tags and the quality is absolutely incredible."</p>
                            <div className="testo-author">
                                <strong>David M.</strong>
                                <span>Sneaker Enthusiast</span>
                            </div>
                        </div>
                        <div className="testimonial-card-v3 glass-panel">
                            <p className="testo-quote">"Sole Sphere sets the standard for authentic footwear in Nairobi. Fast shipping and 100% original pieces every time."</p>
                            <div className="testo-author">
                                <strong>Sarah K.</strong>
                                <span>Verified Collector</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why Sole Sphere ── */}
            <section className="features-v3">
                <div className="container">
                    <div className="v3-features-grid">
                         {[
                            { num: '01', icon: <Star />, title: '100% Authentic', desc: 'Every pair is meticulously inspected by our experts to ensure zero fakes in our collection.' },
                            { num: '02', icon: <ShieldCheck />, title: 'Premium Care', desc: 'Original boxes, spare laces, and verification tags included with every single purchase.' },
                            { num: '03', icon: <TrendingUp />, title: 'Exclusive Drops', desc: 'Access rare silhouettes and limited releases before they hit the general market.' }
                        ].map((feat, idx) => (
                            <motion.div 
                                className="v3-feature-card" key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                                viewport={{ once: true, margin: '-50px' }}
                            >
                                <div className="v3-feat-num">{feat.num}</div>
                                <div className="v3-feature-icon">{feat.icon}</div>
                                <h3>{feat.title}</h3>
                                <p>{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Import Promo ── */}
            <section className="import-promo-v3">
                <div className="container import-flex-v3">
                     <div className="import-text-v3">
                        <span className="v3-sub">Special Services</span>
                        <h2>Exclusive <span className="accent">Sneaker Concierge</span></h2>
                        <p>Hunting for a specific grail? Tell us the model and size, and we'll source it for you from our worldwide network of verified collectors.</p>
                        <button className="btn-v3-dark" onClick={() => window.open(`https://wa.me/${BRAND.whatsapp}`, '_blank')}>
                            Start Sourcing Grail
                        </button>
                    </div>
                     <div className="import-visual-v3">
                        <div className="import-image-wrap">
                            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop" alt="Sneaker Collection" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Social ── */}
            <section className="social-v3 container">
                <div className="social-v3-card">
                    <div className="social-v3-content">
                        <Instagram size={30} />
                        <h3>Follow Our Journey</h3>
                        <p>Check out our latest deliveries and new stock arrivals on Instagram.</p>
                         <a href={BRAND.social?.instagram || '#'} target="_blank" rel="noreferrer" className="btn-v3-social">
                            @solesphere_ke
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
