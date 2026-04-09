import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API}/api/orders/my-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setOrders(await res.json());
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'processing': return <Clock size={16} className="text-amber-500" />;
            case 'shipped': return <Truck size={16} className="text-blue-500" />;
            case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
            default: return <AlertCircle size={16} className="text-gray-400" />;
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="container profile-layout">
                {/* Sidebar */}
                <aside className="profile-sidebar glass">
                    <div className="profile-user-info">
                        <div className="profile-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <h2>{user.username}</h2>
                        <span className="profile-role">{user.role} member</span>
                    </div>
                    <nav className="profile-nav">
                        <button className="active"><Package size={18} /> Order History</button>
                        <button className="text-red-500" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="profile-content">
                    <h1>My Collection History</h1>
                    <p className="profile-subtitle">Review your past architectural kitchen acquisitions.</p>

                    {loading ? (
                        <div className="animate-pulse flex flex-col gap-4 mt-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />)}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="empty-orders glass">
                            <Package size={48} />
                            <h3>No acquisitions yet.</h3>
                            <p>Explore the catalog to find your next masterpiece.</p>
                            <button className="btn btn-primary mt-4" onClick={() => navigate('/products')}>Browse Items</button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card glass">
                                    <div className="order-header">
                                        <div className="order-meta">
                                            <span className="order-id">Order #000{order.id}</span>
                                            <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`order-status badge-${order.status.toLowerCase()}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="order-items-preview">
                                        {order.items?.map(item => (
                                            <div key={item.id} className="order-item-row">
                                                <img src={item.image_url ? `${API}${item.image_url}` : 'https://placehold.co/60'} alt={item.name} />
                                                <div className="item-details">
                                                    <h4>{item.name}</h4>
                                                    <p>Qty: {item.quantity}</p>
                                                </div>
                                                <div className="item-price">
                                                    KES {parseFloat(item.price_at_purchase).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-footer">
                                        <div className="order-total">
                                            <span>Total Investment</span>
                                            <strong>KES {parseFloat(order.total_amount).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Profile;
