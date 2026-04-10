import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    
    const imageUrl = product.image_url
        ? (product.image_url.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "")}${product.image_url}`)
        : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop';

    const isUrgent = product.stock > 0 && product.stock <= 5;
    const stockPercent = Math.min((product.stock / 20) * 100, 100);

    return (
        <div className="sneaker-card-ks animate-reveal">
            <div className="card-media-ks">
                <Link to={`/products/${product.id}`}>
                    <img src={imageUrl} alt={product.name} />
                </Link>
                
                {product.price > 10000 && <span className="badge-ks hot">TOP PICKS</span>}
                {product.status === 'sale' && <span className="badge-ks sale">SALE</span>}
                
                <button 
                    className={`wishlist-btn-ks ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product)}
                >
                    <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
            </div>

            <Link to={`/products/${product.id}`} className="card-info-ks">
                <span className="category-ks">{product.brand} | {product.category}</span>
                <h3 className="name-ks">{product.name}</h3>
                <span className="price-ks">KSh {parseFloat(product.price).toLocaleString()}</span>
                
                {isUrgent && (
                    <div className="stock-meter-ks">
                        <div className="stock-label-ks">
                            <span>Leaving Soon</span>
                            <span>{product.stock} Left</span>
                        </div>
                        <div className="stock-bar-ks">
                            <div className="stock-fill-ks" style={{ width: `${stockPercent}%` }}></div>
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default ProductCard;
