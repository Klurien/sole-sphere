import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Zap,
    Heart,
    Truck,
    Package,
    ShieldCheck,
    X,
    MessageCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { BRAND } from '../brandConfig';
import './ProductDetail.css';

const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : ""));

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProductData = async () => {
            try {
                const targetApiBase = window.VUKA_API_BASE || API;
                const tenantQuery = window.VUKA_TENANT_ID ? `?tenantId=${window.VUKA_TENANT_ID}` : '';
                
                const res = await fetch(`${targetApiBase}/api/products/${id}${tenantQuery}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                setProduct(data);

                // Fetch suggested products
                const params = new URLSearchParams({
                    limit: 4,
                    category: data.category,
                    sort: 'newest'
                });
                if (window.VUKA_TENANT_ID) {
                    params.append('tenantId', window.VUKA_TENANT_ID);
                }
                const allRes = await fetch(`${targetApiBase}/api/products?${params.toString()}`);
                const allData = await allRes.json();

                setRelatedProducts(allData.products.filter(p => p.id !== data.id));

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
                navigate('/products');
            }
        };
        fetchProductData();
    }, [id]);

    if (loading) return <div className="container" style={{padding:'200px 0', textAlign:'center'}}>LACING UP...</div>;
    if (!product) return null;

    const images = product.images?.length > 0
        ? product.images.map(img => img.url.startsWith('http') ? img.url : `${API}${img.url}`)
        : [product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${API}${product.image_url}`) : 'https://placehold.co/800x800?text=Sneaker+Image'];

    const isUrgent = product.stock > 0 && product.stock <= 5;
    const stockPercent = Math.min((product.stock / 20) * 100, 100);

    const handleWhatsApp = () => {
        const message = `Hi Sole Sphere, I am interested in the ${product.name} (${product.brand}) priced at KSh ${parseFloat(product.price).toLocaleString()}. Is this pair still available?`;
        window.open(`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="sneaker-detail-page">
            <Helmet>
                <title>{`${product.name} | ${product.brand} | Sole Sphere`}</title>
                <meta name="description" content={`Shop the ${product.name} at Sole Sphere. Authentic ${product.brand} sneakers.`} />
            </Helmet>

            <div className="container">
                <div className="detail-hero-v3">
                    <div className="detail-media-layout-v3 cinematic-layout">
                        <div className="gallery-col cinematic-gallery">
                            <div className="main-gallery-v3">
                                <img src={images[selectedImageIdx]} alt={product.name} />
                                {images.length > 1 && (
                                    <div className="gallery-nav-v3">
                                        <button className="nav-btn-ks cinematic-nav" onClick={() => setSelectedImageIdx(i => (i - 1 + images.length) % images.length)}>
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button className="nav-btn-ks cinematic-nav" onClick={() => setSelectedImageIdx(i => (i + 1) % images.length)}>
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="thumb-track-v3">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={selectedImageIdx === idx ? 'active thumb-ks' : 'thumb-ks'}
                                        onClick={() => setSelectedImageIdx(idx)}
                                    >
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="specs-sidebar-v3 cinematic-sidebar">
                            <div className="detail-header-v3">
                                <div className="header-text-ks">
                                    <span className="v3-sub">{product.brand} · {product.category}</span>
                                    <h1>{product.name}</h1>
                                </div>
                                <div className="v3-price-impact">
                                    <div className="impact-val">KSh {parseFloat(product.price).toLocaleString()}</div>
                                </div>
                            </div>

                            {isUrgent && (
                                <div className="urgency-card-ks">
                                    <div className="urgency-label-ks">
                                        <span>Inventory Critical</span>
                                        <span>Only {product.stock} Pairs Left</span>
                                    </div>
                                    <div className="urgency-bar-ks">
                                        <div className="urgency-fill-ks" style={{ width: `${stockPercent}%` }}></div>
                                    </div>
                                </div>
                            )}

                            <div className="logistics-grid-ks">
                                <div className="logistics-tile-ks">
                                    <div className="tile-icon-ks"><Truck size={20} /></div>
                                    <div className="tile-text-ks">
                                        <span>Shipping</span>
                                        <span>2-3 Days Delivery</span>
                                    </div>
                                </div>
                                <div className="logistics-tile-ks">
                                    <div className="tile-icon-ks"><Package size={20} /></div>
                                    <div className="tile-text-ks">
                                        <span>Pickup</span>
                                        <span>Available in 24h</span>
                                    </div>
                                </div>
                            </div>

                            <div className="specs-list-ks">
                                <div className="spec-item-ks">
                                    <span>Size</span>
                                    <span>{product.size || 'US 7-13'}</span>
                                </div>
                                <div className="spec-item-ks">
                                    <span>Condition</span>
                                    <span>{product.condition || 'New / Deadstock'}</span>
                                </div>
                                <div className="spec-item-ks">
                                    <span>Authenticity</span>
                                    <span>Guaranteed</span>
                                </div>
                                <div className="spec-item-ks">
                                    <span>ID</span>
                                    <span>#{product.id.toString().padStart(4, '0')}</span>
                                </div>
                            </div>

                            <div className="action-stack-v3">
                                {/* Vuka Ghost: M-Pesa Integration */}
                                {window.VUKA_TENANT_ID && (
                                    <div className="vuka-mpesa-ready">
                                        <button className="mpesa-btn" onClick={() => alert('Vuka Magic: M-Pesa prompt sent to your phone!')}>
                                            <span>Proceed with M-Pesa</span>
                                            <span className="mpesa-logo">M</span>
                                        </button>
                                        <p className="vuka-badge">Secured by Vuka Stealth</p>
                                    </div>
                                )}

                                <button className="primary-btn checkout-btn-ks" onClick={handleWhatsApp}>
                                    <Zap size={18} /> Order via WhatsApp
                                </button>
                                <button 
                                    className={`wishlist-detail-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                                    onClick={() => toggleWishlist(product)}
                                >
                                    <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                                    {isInWishlist(product.id) ? 'Saved' : 'Save for Later'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sneaker-secondary-layout">
                    <div className="info-main-col">
                        <section className="detail-section">
                            <h2 className="section-title-alt">AUTHENTICITY & DETAILS</h2>
                            <div className="description-text">
                                <p>{product.description || `The ${product.name} is a premium release featuring top-tier materials and iconic styling. Every pair is verified by our experts to ensure 100% authenticity.`}</p>
                            </div>
                        </section>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="similar-sneakers-section">
                        <div className="section-header-alt">
                            <h2>YOU MIGHT ALSO LIKE</h2>
                            <Link to="/products" className="view-more">Browse All</Link>
                        </div>
                        <div className="similar-grid-v3">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
