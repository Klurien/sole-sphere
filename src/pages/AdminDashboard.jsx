import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus, Edit2, Trash2, Package, Upload, X, ChevronLeft, ChevronRight,
    Save, BarChart2, ShoppingBag, Users, Star, Search, Check, AlertCircle,
    Image as ImageIcon, GripVertical, Eye, Zap, TrendingUp, Calendar, ArrowRight, Settings, Menu, ShoppingCart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const COLORS = ['#FF7A00', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];
const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : ""));
const CONDITIONS = ['New', 'Deadstock', 'Very Near Deadstock (VNDS)'];
const BRANDS = ['Jordan', 'Nike', 'Adidas', 'New Balance', 'Yeezy'];
const CATEGORIES = ['Lifestyle', 'Basketball', 'Running', 'Streetwear', 'Limited Edition'];

// ─── Image Carousel (for Product Preview) ───────────────────────────────────
const ImageCarousel = ({ images, baseUrl = API }) => {
    const [idx, setIdx] = useState(0);
    const urls = images?.length > 0
        ? images.map(img => img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`)
        : ['https://placehold.co/600x400?text=No+Image'];

    useEffect(() => { setIdx(0); }, [images?.length]);

    return (
        <div className="carousel-wrap">
            <div className="carousel-main">
                <img src={urls[idx]} alt={`Product image ${idx + 1}`} className="carousel-img" />
                {urls.length > 1 && (
                    <>
                        <button className="carousel-btn prev" onClick={() => setIdx(i => (i - 1 + urls.length) % urls.length)}>
                            <ChevronLeft size={20} />
                        </button>
                        <button className="carousel-btn next" onClick={() => setIdx(i => (i + 1) % urls.length)}>
                            <ChevronRight size={20} />
                        </button>
                        <div className="carousel-dots">
                            {urls.map((_, i) => (
                                <button key={i} className={`dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {urls.length > 1 && (
                <div className="carousel-thumbs">
                    {urls.map((u, i) => (
                        <div key={i} className={`thumb-wrap ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)}>
                            <img src={u} alt={`Thumb ${i + 1}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Image Upload Zone ────────────────────────────────────────────────────────
const ImageUploadZone = ({ existingImages, onNewFiles, onDeleteExisting, onReorder }) => {
    const [newPreviews, setNewPreviews] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const fileInputRef = useRef();

    const processFiles = (files) => {
        const valid = Array.from(files); // Allow any file structure uploaded by the seller (Vercel/Local will save them regardless)
        const previews = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }));
        setNewPreviews(prev => [...prev, ...previews]);
        onNewFiles(prev => [...prev, ...valid]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const removeNew = (i) => {
        URL.revokeObjectURL(newPreviews[i].url);
        setNewPreviews(prev => prev.filter((_, j) => j !== i));
        onNewFiles(prev => prev.filter((_, j) => j !== i));
    };

    return (
        <div className="image-upload-zone">
            {existingImages?.length > 0 && (
                <div className="existing-images">
                    <p className="img-section-label">Uploaded Images <span>(drag to reorder)</span></p>
                    <div className="img-grid">
                        {existingImages.map((img, i) => (
                            <div
                                key={img.id}
                                className={`img-tile existing ${dragOverIdx === i ? 'drag-over' : ''}`}
                                draggable
                                onDragStart={e => { e.dataTransfer.setData('existingIdx', i); }}
                                onDragOver={e => { e.preventDefault(); setDragOverIdx(i); }}
                                onDragLeave={() => setDragOverIdx(null)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setDragOverIdx(null);
                                    const from = parseInt(e.dataTransfer.getData('existingIdx'));
                                    if (isNaN(from) || from === i) return;
                                    const reordered = [...existingImages];
                                    const [moved] = reordered.splice(from, 1);
                                    reordered.splice(i, 0, moved);
                                    onReorder(reordered);
                                }}
                            >
                                <img src={`${API}${img.url}`} alt="" />
                                {i === 0 && <span className="primary-badge">Primary</span>}
                                <div className="img-handle"><GripVertical size={14} /></div>
                                <button className="img-delete-btn" type="button" onClick={() => onDeleteExisting(img.id)}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div
                className={`drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <Upload size={28} />
                <p><strong>Drop images here</strong> or click to browse</p>
                <p className="drop-hint">Supports JPG, PNG, WebP — up to 10MB each</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => processFiles(e.target.files)}
                />
            </div>

            {newPreviews.length > 0 && (
                <div className="new-previews">
                    <p className="img-section-label">New images to upload</p>
                    <div className="img-grid">
                        {newPreviews.map((p, i) => (
                            <div key={i} className="img-tile new">
                                <img src={p.url} alt="" />
                                <button className="img-delete-btn" type="button" onClick={() => removeNew(i)}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Product Form Modal ───────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSaved, token }) => {
    const isEdit = !!product;
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || '',
        stock: product?.stock || 0,
        brand: product?.brand || '',
        size: product?.size || '',
        color: product?.color || '',
        material: product?.material || '',
        condition: product?.condition || 'New',
        features: product?.features || '',
    });
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [newFiles, setNewFiles] = useState([]);
    const [deletedIds, setDeletedIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('details');

    useEffect(() => {
        fetch(`${API}/api/categories`).then(res => res.json()).then(setCategories);
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleDeleteExisting = (imgId) => {
        setDeletedIds(prev => [...prev, imgId]);
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
    };

    const handleReorder = (reordered) => {
        setExistingImages(reordered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.price) { setError('Name and price are required.'); return; }
        setSaving(true);
        setError('');

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        newFiles.forEach(f => fd.append('images', f));
        if (deletedIds.length > 0) fd.append('deleted_image_ids', JSON.stringify(deletedIds));
        if (existingImages.length > 0) fd.append('image_order', JSON.stringify(existingImages.map(i => i.id)));

        try {
            const res = await fetch(isEdit ? `${API}/api/products/${product.id}` : `${API}/api/products`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Save failed');
            onSaved(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel">
                <div className="modal-head">
                    <h2>{isEdit ? '✏️ Edit Product' : '➕ New Product'}</h2>
                    <button className="modal-close-btn" onClick={onClose}><X size={22} /></button>
                </div>

                <div className="modal-tabs">
                    {['details', 'images'].map(t => (
                        <button key={t} className={`modal-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'details' ? <Package size={16} /> : <ImageIcon size={16} />}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="form-error"><AlertCircle size={16} /> {error}</div>}
                    {tab === 'details' ? (
                        <div className="tab-content-panel">
                            <div className="form-group-full">
                                <label>Sneaker Model *</label>
                                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Air Jordan 1 Retro High" />
                            </div>
                            <div className="form-row-3">
                                <div className="form-group">
                                    <label>Brand *</label>
                                    <input name="brand" value={form.brand} onChange={handleChange} required placeholder="e.g. Jordan" />
                                </div>
                                <div className="form-group">
                                    <label>Size Range *</label>
                                    <input name="size" value={form.size} onChange={handleChange} required placeholder="e.g. US 7-13" />
                                </div>
                                <div className="form-group">
                                    <label>Price (KES) *</label>
                                    <input type="number" name="price" value={form.price} onChange={handleChange} step="1" required />
                                </div>
                            </div>
                            <div className="form-row-3">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select name="category" value={form.category} onChange={handleChange} required>
                                        <option value="">— Select —</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Condition</label>
                                    <select name="condition" value={form.condition} onChange={handleChange}>
                                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Primary Color</label>
                                    <input name="color" value={form.color} onChange={handleChange} placeholder="e.g. Chicago Red" />
                                </div>
                            </div>
                            <div className="form-row-3">
                                <div className="form-group">
                                    <label>Material</label>
                                    <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. Premium Leather" />
                                </div>
                                <div className="form-group">
                                    <label>Stock Count</label>
                                    <input type="number" name="stock" value={form.stock} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group-full">
                                <label>Key Features (comma-separated)</label>
                                <input name="features" value={form.features} onChange={handleChange} placeholder="e.g. Leather Seats, Panoramic Sunroof, Reverse Camera" />
                            </div>
                            <div className="form-group-full">
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Pristine condition, verified auction grade..." />
                            </div>
                        </div>
                    ) : (
                        <div className="tab-content-panel">
                            <ImageUploadZone
                                existingImages={existingImages}
                                onNewFiles={setNewFiles}
                                onDeleteExisting={handleDeleteExisting}
                                onReorder={handleReorder}
                            />
                        </div>
                    )}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-save" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Promotion Modal ─────────────────────────────────────────────────────────
const PromotionModal = ({ promotion, onClose, onSaved, token }) => {
    const isEdit = !!promotion;
    const [form, setForm] = useState({
        title: promotion?.title || '',
        subtitle: promotion?.subtitle || '',
        link: promotion?.link || '',
    });
    const [newFile, setNewFile] = useState(null);
    const [preview, setPreview] = useState(promotion?.image_url ? `${API}${promotion.image_url}` : null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (newFile) fd.append('image', newFile);

        try {
            const res = await fetch(isEdit ? `${API}/api/promotions/${promotion.id}` : `${API}/api/promotions`, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Save failed');
            onSaved(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel">
                <div className="modal-head">
                    <h2>{isEdit ? '✏️ Edit Flash Sale' : '⚡ New Flash Sale'}</h2>
                    <button className="modal-close-btn" onClick={onClose}><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="form-error"><AlertCircle size={16} /> {error}</div>}
                    <div className="tab-content-panel">
                        <div className="form-group-full">
                            <label>Title</label>
                            <input name="title" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group-full">
                            <label>Subtitle</label>
                            <input name="subtitle" value={form.subtitle} onChange={handleChange} />
                        </div>
                        <div className="form-group-full">
                            <label>Link Destination</label>
                            <input name="link" value={form.link} onChange={handleChange} />
                        </div>
                        <div className="form-group-full">
                            <label>Promotion Banner</label>
                            <div className="promo-preview-wrap" onClick={() => document.getElementById('promo-input').click()}>
                                {preview ? <img src={preview} alt="Preview" /> : <div className="promo-placeholder"><Upload size={32} /><span>Upload Image</span></div>}
                            </div>
                            <input id="promo-input" type="file" hidden onChange={handleFile} accept="image/*" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-save" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Promotion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user } = useAuth();
    const token = user?.token;

    const [activeTab, setActiveTab] = useState('products');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState({ totalRevenue: 0, activeOrders: 0, visitors: 0, inventoryCount: 0 });
    const [chartData, setChartData] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [siteConfig, setSiteConfig] = useState({ whatsapp_number: '' });
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState('');
    const [savingConfig, setSavingConfig] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const tokenOverride = localStorage.getItem('token') || token;
            const headers = tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : {};

            const [pRes, promRes, ordRes, sRes, cRes, tcRes, custRes, actRes, confRes, catsRes] = await Promise.all([
                fetch(`${API}/api/products`),
                fetch(`${API}/api/promotions`),
                fetch(`${API}/api/orders/all`, { headers }),
                fetch(`${API}/api/stats/dashboard`, { headers }),
                fetch(`${API}/api/stats/sales-chart`, { headers }),
                fetch(`${API}/api/stats/top-categories`, { headers }),
                fetch(`${API}/api/stats/customers`, { headers }),
                fetch(`${API}/api/stats/recent-activity`, { headers }),
                fetch(`${API}/api/stats/config`),
                fetch(`${API}/api/categories`)
            ]);

            const pData = pRes.ok ? await pRes.json() : [];
            const promData = promRes.ok ? await promRes.json() : [];
            const sData = sRes.ok ? await sRes.json() : { totalRevenue: 0, activeOrders: 0, visitors: 0, inventoryCount: 0 };
            const cData = cRes.ok ? await cRes.json() : [];
            const tcData = tcRes.ok ? await tcRes.json() : [];
            const confData = confRes.ok ? await confRes.json() : { whatsapp_number: '' };
            const catData = catsRes.ok ? await catsRes.json() : [];

            let custData = [];
            if (custRes.ok) custData = await custRes.json();

            let actData = [];
            if (actRes.ok) actData = await actRes.json();

            let ordData = [];
            if (ordRes.ok) {
                ordData = await ordRes.json();
            }

            setProducts(Array.isArray(pData) ? pData : []);
            setPromotions(Array.isArray(promData) ? promData : []);
            setOrders(Array.isArray(ordData) ? ordData : []);
            setStats(sData);
            setChartData(Array.isArray(cData) ? cData : []);
            setTopCategories(Array.isArray(tcData) ? tcData : []);
            setCustomers(Array.isArray(custData) ? custData : []);
            setRecentActivity(Array.isArray(actData) ? actData : []);
            setSiteConfig(confData);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (err) {
            console.error('Failed dashboard data load:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleProductSaved = (saved) => {
        setProducts(prev => {
            const exists = prev.find(p => p.id === saved.id);
            if (exists) return prev.map(p => p.id === saved.id ? saved : p);
            return [saved, ...prev];
        });
        showToast('Product saved!');
    };

    const handlePromoSaved = (saved) => {
        setPromotions(prev => {
            const exists = prev.find(p => p.id === saved.id);
            if (exists) return prev.map(p => p.id === saved.id ? saved : p);
            return [...prev, saved];
        });
        showToast('Promotion saved!');
    };

    const handleDeleteProduct = async (product) => {
        try {
            await fetch(`${API}/api/products/${product.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(prev => prev.filter(p => p.id !== product.id));
            setDeleteConfirm(null);
            showToast('Product deleted.', 'error');
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    const handleDeletePromo = async (id) => {
        try {
            await fetch(`${API}/api/promotions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setPromotions(prev => prev.filter(p => p.id !== id));
            showToast('Promotion deleted.', 'error');
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    const handleResetCatalog = async () => {
        if (!window.confirm("ARE YOU SURE? This will permanently wipe ALL products and promotions to give you a clean slate for actual data!")) return;

        try {
            await fetch(`${API}/api/products/reset`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Catalog completely wiped.');
            fetchData();
        } catch {
            showToast('Failed to wipe catalog.', 'error');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const tokenOverride = localStorage.getItem('token') || token;
            const res = await fetch(`${API}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenOverride}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                showToast(`Order #${orderId} marked as ${newStatus}`);
            }
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setSavingConfig(true);
        try {
            const tokenOverride = localStorage.getItem('token') || token;
            const res = await fetch(`${API}/api/stats/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenOverride}`
                },
                body: JSON.stringify(siteConfig)
            });
            if (res.ok) {
                showToast('Settings updated successfully!');
            }
        } catch {
            showToast('Failed to update settings', 'error');
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        try {
            const res = await fetch(`${API}/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token') || token}`
                },
                body: JSON.stringify({ name: newCat })
            });
            const data = await res.json();
            if (res.ok) {
                setCategories(prev => [...prev, data]);
                setNewCat('');
                showToast('Category added!');
            } else {
                showToast(data.message, 'error');
            }
        } catch {
            showToast('Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Deleting this category will not remove products, but they will be 'Uncategorized'. Proceed?")) return;
        try {
            const res = await fetch(`${API}/api/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || token}` }
            });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
                showToast('Category deleted', 'error');
            }
        } catch {
            showToast('Failed to delete category', 'error');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="admin-access-denied container">
                <AlertCircle size={64} />
                <h2>Access Denied</h2>
                <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
        );
    }

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="admin-page">
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

            <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
                <button className="mobile-sidebar-close" onClick={() => setMobileSidebarOpen(false)}><X size={24} /></button>
                <div className="sidebar-brand">
                    <div className="sidebar-logo-icon"><Zap size={20} strokeWidth={2.5} /></div>
                    <span>SOLE <span className="text-secondary-label">SPHERE</span></span>
                </div>
                <div className="sidebar-mobile-label">DASHBOARD MENU</div>
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
                    >
                        <TrendingUp size={18} /> Overview
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('orders'); setMobileSidebarOpen(false); }}
                    >
                        <Package size={18} /> Orders
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('products'); setMobileSidebarOpen(false); }}
                    >
                        <ShoppingBag size={18} /> Inventory
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'promotions' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('promotions'); setMobileSidebarOpen(false); }}
                    >
                        <Zap size={18} /> Campaigns
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('customers'); setMobileSidebarOpen(false); }}
                    >
                        <Users size={18} /> Customers
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
                    >
                        <Settings size={18} /> Settings
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-store-link">
                        <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Return to Store
                    </Link>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <button className="mobile-dashboard-toggle" onClick={() => setMobileSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="topbar-welcome">
                        <span className="v3-sub">MANAGEMENT CONSOLE</span>
                        <h1>{activeTab.toUpperCase()}</h1>
                    </div>
                    <div className="topbar-actions">
                        {activeTab === 'products' && (
                            <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={handleResetCatalog}>
                                <Trash2 size={20} /> Wipe Demo Data
                            </button>
                        )}
                        {activeTab === 'promotions' && (
                            <button className="btn btn-accent" onClick={() => { setEditingPromo(null); setShowPromoModal(true); }}>
                                <Plus size={20} /> New Campaign
                            </button>
                        )}
                        <div className="admin-user-pill">
                            <div className="user-avatar">AD</div>
                            <span>System Admin</span>
                        </div>
                    </div>
                </header>

                <div className="stats-ribbon-v3">
                    <div className="stat-card-v3 glass-panel">
                        <span className="stat-label">TOTAL REVENUE (EST)</span>
                        <div className="stat-main">
                            <span className="stat-val">KES {parseFloat(stats.totalRevenue).toLocaleString()}</span>
                            <TrendingUp size={20} className="stat-up" />
                        </div>
                    </div>
                    <div className="stat-card-v3 glass-panel">
                        <span className="stat-label">ACTIVE INQUIRIES</span>
                        <div className="stat-main">
                            <span className="stat-val">{stats.activeOrders}</span>
                            <ShoppingBag size={20} className="stat-icon" />
                        </div>
                    </div>
                    <div className="stat-card-v3 glass-panel">
                        <span className="stat-label">REVENUE VISITS</span>
                        <div className="stat-main">
                            <span className="stat-val">{(stats.visitors).toLocaleString()}</span>
                            <Users size={20} className="stat-icon" />
                        </div>
                    </div>
                    <div className="stat-card-v3 glass-panel">
                        <span className="stat-label">LIVE INVENTORY</span>
                        <div className="stat-main">
                            <span className="stat-val">{stats.inventoryCount}</span>
                            <ShoppingBag size={20} className="stat-icon" />
                        </div>
                    </div>
                </div>

                {activeTab === 'products' && (
                    <div className="admin-content-grid">
                        <div className="product-list-panel">
                            <div className="list-search">
                                <Search size={16} />
                                <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="product-rows">
                                <div className="add-product-row" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                                    <div className="add-icon-circle">
                                        <Plus size={20} />
                                    </div>
                                    <div className="add-row-info">
                                        <p className="add-title">Add New Product</p>
                                        <p className="add-subtitle">Create a new masterpiece in your catalog</p>
                                    </div>
                                    <ArrowRight size={18} className="add-arrow" />
                                </div>
                                {filteredProducts.map(p => (
                                    <div key={p.id} className={`product-row ${selectedProduct?.id === p.id ? 'selected' : ''}`} onClick={() => setSelectedProduct(p)}>
                                        <div className="row-img-wrap"><img src={p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `${API}${p.image_url}`) : 'https://placehold.co/100'} alt="" /></div>
                                        <div className="row-info">
                                            <p className="row-name">{p.name}</p>
                                            <p className="row-meta">{p.brand} • {p.condition} • {p.size}</p>
                                        </div>
                                        <div className="row-price">KES {parseFloat(p.price).toLocaleString()}</div>
                                        <div className="row-actions">
                                            <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setShowModal(true); }}><Edit2 size={16} /></button>
                                            <button className="action-btn del" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p); }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="product-detail-panel">
                            {selectedProduct ? (
                                <>
                                    <ImageCarousel images={selectedProduct.images} />
                                    <div className="detail-body">
                                        <h3>{selectedProduct.brand} {selectedProduct.name}</h3>
                                        <p className="detail-price">KES {parseFloat(selectedProduct.price).toLocaleString()}</p>
                                        <div className="detail-specs-mini">
                                            <span><strong>Size:</strong> {selectedProduct.size}</span>
                                            <span><strong>Color:</strong> {selectedProduct.color}</span>
                                            <span><strong>Material:</strong> {selectedProduct.material}</span>
                                        </div>
                                        <p className="detail-desc">{selectedProduct.description}</p>
                                    </div>
                                </>
                            ) : <div className="detail-empty"><Package size={48} /><p>Select a product to preview</p></div>}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="admin-items-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {orders.length === 0 ? (
                            <div className="admin-empty-state glass">
                                <Package size={48} />
                                <h3>No Orders Yet</h3>
                                <p>When customers complete a transaction, it will appear here.</p>
                            </div>
                        ) : (
                            <div className="admin-table-container glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <table className="admin-table w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="p-4 rounded-tl-xl text-sm font-semibold uppercase tracking-wider">Order ID</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Customer</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Date</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Total</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <React.Fragment key={order.id}>
                                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-bold">#000{order.id}</td>
                                                    <td className="p-4">
                                                        {order.username ? order.username : 'Guest User'}
                                                    </td>
                                                    <td className="p-4 text-sm opacity-80">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 font-bold text-[var(--accent-color)]">KES {parseFloat(order.total_amount).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <select
                                                            className={`status-select ${order.status.toLowerCase()}`}
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                        >
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-white/20 bg-black/20">
                                                    <td colSpan="5" className="p-4 text-sm">
                                                        <div className="flex flex-col gap-2">
                                                            <strong>Line Items:</strong>
                                                            {order.items?.map(item => (
                                                                <div key={item.id} className="flex gap-4 items-center pl-4 border-l-2 border-white/10">
                                                                    <div className="w-8 h-8 rounded bg-white/10 overflow-hidden flex-shrink-0">
                                                                        <img src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API}${item.image_url}`) : 'https://placehold.co/40'} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <span>{item.name} <span className="opacity-60">x{item.quantity}</span></span>
                                                                    <span className="ml-auto opacity-80">KES {parseFloat(item.price_at_purchase).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'promotions' && (
                    <div className="promotions-grid">
                        {promotions.map(promo => (
                            <div key={promo.id} className="promo-manage-card">
                                <img src={`${API}${promo.image_url}`} alt="" />
                                <div className="promo-manage-info">
                                    <h4>{promo.title}</h4>
                                    <p>{promo.subtitle}</p>
                                    <div className="promo-manage-actions">
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingPromo(promo); setShowPromoModal(true); }}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeletePromo(promo.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="promo-add-card" onClick={() => { setEditingPromo(null); setShowPromoModal(true); }}>
                            <Plus size={32} />
                            <span>Add Flash Sale</span>
                        </div>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="dashboard-overview-grid">
                        <div className="overview-main">
                            <div className="chart-placeholder glass" style={{ paddingTop: '24px' }}>
                                <div className="chart-header">
                                    <h3>Sales Velocity</h3>
                                    <div className="chart-legend">
                                        <span className="legend-item"><span className="dot revenue"></span> Live Revenue (7d)</span>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: 320, marginTop: '20px' }}>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer>
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0.05} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickFormatter={val => new Date(val).toLocaleDateString([], { weekday: 'short' })} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickFormatter={val => `KES ${val.toLocaleString()}`} />
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#1C1F24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} formatter={(val) => [`KES ${parseFloat(val).toLocaleString()}`, 'Revenue']} labelFormatter={val => new Date(val).toDateString()} />
                                                <Area type="monotone" dataKey="amount" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="no-data-msg">Waiting for first sales...</div>
                                    )}
                                </div>
                            </div>
                            <div className="dashboard-grid-2">
                                <div className="overview-card glass">
                                    <h4>Top Categories</h4>
                                    {topCategories.length > 0 ? (
                                        <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie data={topCategories} dataKey="total_sales" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                                                        {topCategories.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1C1F24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} formatter={(val) => [`KES ${parseFloat(val).toLocaleString()}`, 'Sales']} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <p className="opacity-50 text-sm">No categorical data yet</p>
                                    )}
                                </div>
                                <div className="overview-card glass">
                                    <h4>Stock Alerts</h4>
                                    <div className="mini-list" style={{ marginTop: '20px' }}>
                                        {products.filter(p => p.stock < 10 && p.stock !== null).slice(0, 4).map(p => (
                                            <div key={p.id} className="mini-item warning">
                                                <AlertCircle size={16} className="text-orange-500" />
                                                <span>{p.name}</span> <span className="text-orange-400 font-bold">{p.stock} left</span>
                                            </div>
                                        ))}
                                        {products.filter(p => p.stock < 10 && p.stock !== null).length === 0 && (
                                            <p className="all-good"><Check size={16} /> All stock levels healthy</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overview-sidebar">
                            <div className="activity-panel glass h-full">
                                <h3>Live Data Feed</h3>
                                <div className="activity-list">
                                    {recentActivity.map((act, i) => (
                                        <div key={i} className="activity-item">
                                            <div className="activity-icon primary"><ShoppingBag size={14} /></div>
                                            <div className="activity-info">
                                                <p>Order #{act.id} by <strong>{act.username || 'Guest'}</strong></p>
                                                <span className="text-xs text-[var(--primary)]">KES {parseFloat(act.total_amount).toLocaleString()} • {act.status}</span>
                                                <span className="block mt-1">{new Date(act.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && (
                                        <p className="opacity-50 text-sm p-4">Awaiting network activity...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="admin-items-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {customers.length === 0 ? (
                            <div className="placeholder-screen glass">
                                <Users size={48} className="text-accent" />
                                <h2>Customer Registry Empty</h2>
                                <p>No registered users found in the database yet.</p>
                            </div>
                        ) : (
                            <div className="admin-table-container glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <table className="admin-table w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-black/20">
                                            <th className="p-4 rounded-tl-xl text-sm font-semibold uppercase tracking-wider">User ID</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Username</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Role</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Total Orders</th>
                                            <th className="p-4 text-sm font-semibold uppercase tracking-wider">Lifetime Value</th>
                                            <th className="p-4 rounded-tr-xl text-sm font-semibold uppercase tracking-wider">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(c => (
                                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-bold text-white/50">#{c.id}</td>
                                                <td className="p-4 font-semibold text-white">{c.username}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/10 text-orange-300'}`}>
                                                        {c.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4">{c.total_orders} orders</td>
                                                <td className="p-4 font-bold text-[var(--primary)]">KES {parseFloat(c.total_spent).toLocaleString()}</td>
                                                <td className="p-4 text-sm opacity-80">{new Date(c.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="admin-items-grid" style={{ gridTemplateColumns: 'minmax(0, 600px)' }}>
                        <div className="admin-form-panel glass p-8" style={{ borderRadius: '16px' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-[var(--primary)] text-black">
                                    <Settings size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Store Configuration</h2>
                                    <p className="opacity-60 text-sm">Update your store's global contact settings.</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateConfig} className="space-y-6">
                                <div className="form-group-full">
                                    <label className="text-sm font-semibold text-white/80 block mb-2 uppercase tracking-widest">WhatsApp Checkout Number</label>
                                    <p className="text-xs opacity-50 mb-3 italic">Format: 254XXXXXXXXX (No + sign). Used for redirected checkout messages.</p>
                                    <input
                                        type="text"
                                        placeholder="e.g. 254789249004"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--primary)] outline-none transition-all text-lg font-mono"
                                        value={siteConfig.whatsapp_number}
                                        onChange={e => setSiteConfig({ ...siteConfig, whatsapp_number: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingConfig}
                                    className="w-full bg-[var(--primary)] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {savingConfig ? 'Saving Changes...' : 'Save Global Settings'}
                                </button>
                            </form>

                            <div className="mt-12 pt-8 border-t border-white/10">
                                <h3 className="text-xl font-bold text-white mb-6">Manage Sneaker Categories</h3>
                                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        placeholder="New Category Name..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[var(--primary)]"
                                        value={newCat}
                                        onChange={e => setNewCat(e.target.value)}
                                    />
                                    <button type="submit" className="p-3 bg-white text-black font-bold rounded-lg hover:bg-[var(--primary)] transition-colors">
                                        <Plus size={20} />
                                    </button>
                                </form>

                                <div className="category-chips flex flex-wrap gap-3">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="group relative flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold hover:border-red-500/50 transition-colors">
                                            {cat.name}
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-1 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && <ProductModal product={editingProduct} onClose={() => setShowModal(false)} onSaved={handleProductSaved} token={token} />}
            {showPromoModal && <PromotionModal promotion={editingPromo} onClose={() => setShowPromoModal(false)} onSaved={handlePromoSaved} token={token} />}
        </div>
    );
};

export default AdminDashboard;
