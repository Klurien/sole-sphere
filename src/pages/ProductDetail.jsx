import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Palette,
    Ruler,
    Settings,
    Dna,
    Phone,
    MessageSquare,
    Calendar,
    Zap,
    ShieldCheck,
    X,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Grid
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import { BRAND } from '../brandConfig';
import './ProductDetail.css';

const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : ""));

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const panStart = useRef({ x: 0, y: 0 });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProductData = async () => {
            try {
                const res = await fetch(`${API}/api/products/${id}`);
                const data = await res.json();
                setProduct(data);

                // Fetch suggested products (by category or make)
                const params = new URLSearchParams({
                    limit: 15,
                    category: data.category,
                    sort: 'newest'
                });
                const allRes = await fetch(`${API}/api/products?${params.toString()}`);
                const allData = await allRes.json();
                const filtered = allData.products.filter(p => p.id !== data.id);
                setRelatedProducts(filtered);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
                navigate('/products');
            }
        };
        fetchProductData();
    }, [id]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const whatsappMsg = `Inquiry for ${product.name} (${product.brand}):\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
        window.open(`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    };

    // ── Lightbox helpers ──────────────────────────────────────
    const openLightbox = (idx) => {
        setLightboxIdx(idx);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        document.body.style.overflow = '';
    };

    const lightboxNext = () => {
        setLightboxIdx(i => (i + 1) % images.length);
        setZoom(1); setPan({ x: 0, y: 0 });
    };

    const lightboxPrev = () => {
        setLightboxIdx(i => (i - 1 + images.length) % images.length);
        setZoom(1); setPan({ x: 0, y: 0 });
    };

    const handleWheelZoom = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoom(z => Math.min(5, Math.max(1, z + delta)));
        if (zoom <= 1) setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { ...pan };
    };
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({
            x: panStart.current.x + (e.clientX - dragStart.current.x),
            y: panStart.current.y + (e.clientY - dragStart.current.y),
        });
    };
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowRight') lightboxNext();
            if (e.key === 'ArrowLeft')  lightboxPrev();
            if (e.key === '+')           setZoom(z => Math.min(5, z + 0.5));
            if (e.key === '-')           setZoom(z => Math.max(1, z - 0.5));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, lightboxIdx, zoom]);

    if (loading) {
        return (
            <div className="product-detail-skeleton-v3 container">
                <div className="skel-grid">
                    <div className="skel-media pulse shimmer-bg"></div>
                    <div className="skel-content">
                        <div className="skel-title pulse shimmer-bg"></div>
                        <div className="skel-specs pulse shimmer-bg"></div>
                        <div className="skel-form pulse shimmer-bg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const images = product.images?.length > 0
        ? product.images.map(img => img.url.startsWith('http') ? img.url : `${API}${img.url}`)
        : [product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${API}${product.image_url}`) : 'https://placehold.co/800x600?text=Sneaker+Image'];

    const shoeSpecs = [
        { icon: <Dna size={20} />, label: 'Category', value: product.category || 'Lifestyle' },
        { icon: <Zap size={20} />, label: 'Brand', value: product.brand || 'Jordan' },
        { icon: <Ruler size={20} />, label: 'Size', value: product.size || 'US 7-13' },
        { icon: <Palette size={20} />, label: 'Color', value: product.color || 'Multi' },
        { icon: <Settings size={20} />, label: 'Material', value: product.material || 'Leather' },
        { icon: <ShieldCheck size={20} />, label: 'Condition', value: product.condition || 'New' },
    ];

    let featuresArray = ["Authentic Box", "Spare Laces", "Premium Packaging", "Verification Tag", "Quick Shipping"];
    if (product.features) {
        try {
            const parsed = JSON.parse(product.features);
            if (Array.isArray(parsed)) featuresArray = parsed;
        } catch {
            featuresArray = product.features.split(',').map(f => f.trim());
        }
    }

    return (
        <div className="sneaker-detail-page">
            <Helmet>
                <title>{`${product.name} | ${product.brand} | Sole Sphere`}</title>
                <meta name="description" content={`Shop the ${product.name} at Sole Sphere. Price: KSh ${parseFloat(product.price).toLocaleString()}. Authentic ${product.brand} sneakers with worldwide shipping.`} />
                
                {/* OpenGraph / Social */}
                <meta property="og:title" content={`${product.name} | Sole Sphere`} />
                <meta property="og:description" content={`Exclusive ${product.brand} ${product.name}. Price: KSh ${parseFloat(product.price).toLocaleString()}. Available now at Sole Sphere.`} />
                <meta property="og:image" content={images[0]} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={`https://solesphere.com/products/${product.id}`} />

                {/* Structured Data (JSON-LD) for Google Shopping/Search */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "image": images,
                        "description": product.description || `Premium ${product.brand} ${product.name} available at Sole Sphere.`,
                        "brand": {
                            "@type": "Brand",
                            "name": product.brand
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": window.location.href,
                            "priceCurrency": "KES",
                            "price": product.price,
                            "itemCondition": product.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
                            "availability": "https://schema.org/InStock"
                        }
                    })}
                </script>
            </Helmet>

            <div className="container">
                <div className="detail-hero-v3">
                    <div className="detail-header-v3">
                        <div className="detail-header-v3">
                            <span className="v3-sub">{product.brand} COLLECTION</span>
                            <h1>{product.name}</h1>
                        </div>
                        <div className="v3-price-impact">
                            <span className="impact-label">Retail Price</span>
                            <div className="impact-val">KSh {parseFloat(product.price).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="detail-media-layout-v3">
                        {/* ── Main Gallery ── */}
                        <div className="gallery-col">
                            <div
                                className="main-gallery-v3"
                                onClick={() => openLightbox(selectedImageIdx)}
                                title="Click to zoom"
                            >
                                <img src={images[selectedImageIdx]} alt={product.name} />
                                <div className="gallery-overlay-ui">
                                    <div className="gallery-counter">{selectedImageIdx + 1} / {images.length}</div>
                                    <div className="gallery-zoom-hint">
                                        <Maximize2 size={14} />
                                        <span>Click to expand</span>
                                    </div>
                                </div>
                                {images.length > 1 && (
                                    <div className="gallery-nav-v3">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedImageIdx(i => (i - 1 + images.length) % images.length); }}>
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedImageIdx(i => (i + 1) % images.length); }}>
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Thumbnails */}
                            <div className="thumb-track-v3">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={selectedImageIdx === idx ? 'active' : ''}
                                        onClick={() => setSelectedImageIdx(idx)}
                                    >
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Specs Sidebar ── */}
                        <div className="specs-sidebar-v3">
                            <div className="specs-grid-v3">
                                {shoeSpecs.map((spec, i) => (
                                    <div key={i} className="spec-tile-v3 glass-panel">
                                        <div className="tile-icon-v3">{spec.icon}</div>
                                        <div className="tile-info-v3">
                                            <span className="tile-label-v3">{spec.label}</span>
                                            <span className="tile-val-v3">{spec.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="action-stack-v3">
                                <button
                                    className="primary-btn wide-btn"
                                    onClick={() => window.open(`https://wa.me/${BRAND.whatsapp}?text=I%20am%20interested%20in%20the%20${product.name}%20sneakers`, '_blank')}
                                >
                                    <Zap size={18} /> BUY NOW
                                </button>
                                <div className="alt-actions-v3">
                                    <a href={`tel:${BRAND.phone}`} className="glass-btn flex-1 j-center"><Phone size={16} /> CALL</a>
                                    <button onClick={() => window.open(`https://wa.me/${BRAND.whatsapp}`, '_blank')} className="glass-btn flex-1 j-center"><MessageSquare size={16} /> CHAT</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sneaker-secondary-layout">
                    {/* Left: Description & Features */}
                    <div className="info-main-col">
                        <section className="detail-section">
                            <h2 className="section-title-alt">The Story</h2>
                            <div className="description-text">
                                <p>{product.description || `The ${product.name} is a testament to sneaker innovation and heritage. Crafted with premium materials and iconic silhouette, it remains a staple for enthusiasts and casual wearers alike.`}</p>
                                <ul className="key-bullet-points">
                                    <li>100% Authentic Guaranteed</li>
                                    <li>Premium {product.material} Construction</li>
                                    <li>Limited Edition {product.category} Series</li>
                                    <li>Verified Condition: {product.condition}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="detail-section">
                            <h2 className="section-title-alt">Top Features</h2>
                            <div className="features-checklist-v3">
                                {featuresArray.map((feat, i) => (
                                    <div key={i} className="feature-check-item">
                                        <div className="check-dot"></div>
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Inquiry Form */}
                    <aside className="inquiry-sidebar">
                        <div className="inquiry-card glass-v2">
                            <h3>Send an <span className="highlight">Inquiry</span></h3>
                            <form onSubmit={handleFormSubmit} className="sidebar-form">
                                <div className="form-group-v3">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-v3">
                                    <label>Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+254..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-v3">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-v3">
                                    <label>Message *</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="I am interested in this pair..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" className="submit-inquiry-btn">Submit Inquiry</button>
                            </form>
                        </div>
                    </aside>
                </div>

                {/* Similar Sneakers */}
                {relatedProducts.length > 0 && (
                    <section className="similar-sneakers-section">
                        <div className="section-header-alt">
                            <h2>SUGGESTED <span className="highlight">FOR YOU</span></h2>
                            <Link to="/products" className="view-more">Browse Collection</Link>
                        </div>
                        <div className="similar-grid-v3">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} compact />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ── LIGHTBOX ── */}
            {lightboxOpen && (
                <div
                    className="lightbox-overlay"
                    onClick={closeLightbox}
                >
                    {/* Top Bar */}
                    <div className="lightbox-topbar" onClick={e => e.stopPropagation()}>
                        <span className="lightbox-title">{product.year} {product.name}</span>
                        <div className="lightbox-controls">
                            <span className="lightbox-counter">{lightboxIdx + 1} / {images.length}</span>
                            <button className="lb-ctrl-btn" onClick={() => setZoom(z => Math.max(1, z - 0.5))} title="Zoom out (−)">
                                <ZoomOut size={18} />
                            </button>
                            <span className="lb-zoom-level">{Math.round(zoom * 100)}%</span>
                            <button className="lb-ctrl-btn" onClick={() => setZoom(z => Math.min(5, z + 0.5))} title="Zoom in (+)">
                                <ZoomIn size={18} />
                            </button>
                            <button className="lb-ctrl-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset zoom">
                                <Grid size={18} />
                            </button>
                            <button className="lb-ctrl-btn lb-close" onClick={closeLightbox} title="Close (Esc)">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Image Area */}
                    <div
                        className={`lightbox-stage ${zoom > 1 ? 'zoomed' : ''}`}
                        onClick={e => e.stopPropagation()}
                        onWheel={handleWheelZoom}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            src={images[lightboxIdx]}
                            alt={product.name}
                            style={{
                                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'zoom-in'),
                                transition: isDragging ? 'none' : 'transform 0.2s ease',
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Prev / Next */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="lb-nav lb-prev"
                                onClick={e => { e.stopPropagation(); lightboxPrev(); }}
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                className="lb-nav lb-next"
                                onClick={e => { e.stopPropagation(); lightboxNext(); }}
                            >
                                <ChevronRight size={28} />
                            </button>
                        </>
                    )}

                    {/* Bottom Thumbnail Rail */}
                    {images.length > 1 && (
                        <div className="lightbox-thumb-rail" onClick={e => e.stopPropagation()}>
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`lb-thumb ${lightboxIdx === idx ? 'active' : ''}`}
                                    onClick={() => { setLightboxIdx(idx); setZoom(1); setPan({ x: 0, y: 0 }); }}
                                >
                                    <img src={img} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Keyboard hint */}
                    <div className="lightbox-kb-hint">
                        ← → Navigate &nbsp;|&nbsp; Scroll to zoom &nbsp;|&nbsp; Esc to close
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;

