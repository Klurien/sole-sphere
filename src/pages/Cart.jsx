import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const [whatsappNumber, setWhatsappNumber] = useState("254741740376");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");
        fetch(`${API}/api/stats/config`)
            .then(res => res.json())
            .then(data => {
                if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
            })
            .catch(err => console.error("Config fetch fail", err));
    }, []);

    const handleWhatsAppCheckout = () => {
        const sellerPhone = whatsappNumber;
        let message = "Niaje boss! I'd like to place an order:%0A%0A";
        cart.forEach(item => {
            message += `- ${item.name} (Qty: ${item.quantity}) = KES ${(item.price * item.quantity).toLocaleString()}%0A`;
        });
        message += `%0A*Total: KES ${cartTotal.toLocaleString()}*`;

        window.open(`https://wa.me/${sellerPhone}?text=${message}`, '_blank');
    };

    if (cart.length === 0) {
        return (
            <div className={`cart-empty container ${isLoaded ? 'fade-in' : ''}`}>
                <div className="empty-visual">
                    <ShoppingBag size={80} strokeWidth={1} />
                    <div className="empty-rings"></div>
                </div>
                <h2>Your Collection Awaits</h2>
                <p>It seems your culinary finds are currently exploring elsewhere. Professional tools are just a click away.</p>
                <Link to="/products" className="btn btn-primary glow">Start Your Collection</Link>
            </div>
        );
    }

    return (
        <div className={`cart-page container ${isLoaded ? 'fade-in' : ''}`}>
            <div className="editorial-header">
                <span className="eyebrow">Checkout</span>
                <h1>Your Selection</h1>
                <p>Review the professional tools selected for your culinary artistry.</p>
            </div>

            <div className="cart-grid">
                <div className="cart-items-panel">
                    {cart.map(item => (
                        <div key={item.id} className="premium-cart-item glass">
                            <Link to={`/products/${item.id}`} className="item-image">
                                <img src={`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "")}${item.image_url}`} alt={item.name} />
                            </Link>
                            <div className="item-details">
                                <div className="item-header">
                                    <span className="item-cat">{item.category}</span>
                                    <h3 className="item-name">{item.name}</h3>
                                </div>
                                <div className="item-controls">
                                    <div className="quantity-architect">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                            <Minus size={14} />
                                        </button>
                                        <span className="qty-num">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button className="item-remove-btn" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 size={16} /> <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                            <div className="item-price-side">
                                <span className="price-label">Estimated</span>
                                <span className="price-val">KES {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-checkout-panel">
                    <div className="checkout-card glass sticky-card">
                        <h3>Inventory Summary</h3>
                        <div className="summary-list">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>KES {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-line">
                                <span>Artisan Shipping</span>
                                <span className="free-text">Priority Included</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-line total">
                                <span>Grand Total</span>
                                <span>KES {cartTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="btn btn-accent btn-full glow" onClick={handleWhatsAppCheckout}>
                            Checkout via WhatsApp
                        </button>
                        <Link to="/checkout" className="btn btn-outline btn-full" style={{ marginTop: '10px', textAlign: 'center' }}>
                            Express Delivery Checkout
                        </Link>

                        <div className="checkout-trust">
                            <div className="trust-bit">
                                <ShieldCheck size={14} /> <span>End-to-End Encryption</span>
                            </div>
                            <div className="trust-bit">
                                <Truck size={14} /> <span>Artisan Packaging</span>
                            </div>
                            <div className="trust-bit">
                                <RefreshCcw size={14} /> <span>Authenticity Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
