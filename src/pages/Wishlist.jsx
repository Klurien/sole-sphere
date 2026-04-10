import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist } = useWishlist();

    return (
        <div className="wishlist-page-ks">
            <Helmet>
                <title>My Wishlist | Sole Sphere</title>
            </Helmet>

            <div className="container">
                <div className="wishlist-header-ks">
                    <h1>YOUR WISHLIST</h1>
                    <p>{wishlist.length} SAVED ITEMS</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="wishlist-empty-ks">
                        <Heart size={64} color="#eee" style={{ marginBottom: '30px' }} />
                        <h2>YOUR WISHLIST IS EMPTY</h2>
                        <p>Save items you like to keep track of them here.</p>
                        <Link to="/products" className="h-action-btn-ks" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                            START SHOPPING
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid-ks">
                        {wishlist.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
