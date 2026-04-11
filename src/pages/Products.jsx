import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Filter, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import CardSkeleton from '../components/product/CardSkeleton';
import './Products.css';

const BRANDS = ['All', 'Nike', 'Jordan', 'Adidas', 'New Balance', 'Yeezy', 'Puma', 'Reebok'];
const CATEGORIES = ['All', 'Lifestyle', 'Basketball', 'Running', 'Streetwear'];

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    // Filter state
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [sort, setSort] = useState('newest');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                brand: selectedBrand !== 'All' ? selectedBrand : '',
                category: selectedCategory !== 'All' ? selectedCategory : '',
                sort: sort,
                limit: 100 // Load all for now for better UX
            });

            const targetApiBase = window.VUKA_API_BASE || API;
            if (window.VUKA_TENANT_ID) {
                params.append('tenantId', window.VUKA_TENANT_ID);
            }
            const res = await fetch(`${targetApiBase}/api/products?${params.toString()}`);
            const data = await res.json();


            setProducts(data.products);
            setTotalResults(data.total);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedBrand, selectedCategory, sort]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBrand('All');
        setSelectedCategory('All');
        setSort('newest');
        setSearchParams({});
    };

    return (
        <div className="inventory-page-v3">
            <Helmet>
                <title>Collection | Sole Sphere Premium Sneakers</title>
                <meta name="description" content="Shop the most exclusive sneakers in Kenya. Authentic pairs from Nike, Jordan, Yeezy and more." />
            </Helmet>

            <div className="inventory-header-v3">
                <div className="container">
                    <span className="v3-sub">Curated Performance</span>
                    <h1 className="cinematic-title">The Collection</h1>
                    <p>Discover authentic, hand-picked drops from the world's most iconic sneaker brands and designers.</p>
                </div>
            </div>

            <div className="v3-toolbar-top">
                <div className="container toolbar-inner-ks">
                    <div className="toolbar-info-v3">
                        <p>{totalResults} Items Found</p>
                    </div>
                    <div className="toolbar-actions-v3">
                        <button className="h-action-btn-ks" onClick={() => setSidebarOpen(true)}>
                            <Filter size={16} />
                            <span>Filter & Sort</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="inventory-main-v3">
                <div className="container">
                    {loading ? (
                        <div className="v3-inventory-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="v3-inventory-grid">
                            {products.map(shoe => (
                                <ProductCard key={shoe.id} product={shoe} />
                            ))}
                        </div>
                    ) : (
                        <div className="v3-empty-state">
                            <h3>No Products Found</h3>
                            <p>Try adjusting your search or filters to find what you're looking for.</p>
                            <button className="primary-btn" onClick={clearFilters}>Clear All Filters</button>
                        </div>
                    )}
                </div>
            </main>

            {/* Filter Drawer */}
            <div className={`drawer-overlay-ks ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)}></div>
            <aside className={`filter-drawer-ks ${sidebarOpen ? 'open' : ''}`}>
                <div className="drawer-header-ks">
                    <h2>Filter & Sort</h2>
                    <button className="close-drawer-ks" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="drawer-content-ks">
                    <div className="filter-group-ks">
                        <label>Search</label>
                        <input 
                            type="text" 
                            className="search-input-ks" 
                            placeholder="Find your next pair..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-group-ks">
                        <label>Brand</label>
                        <div className="filter-options-ks">
                            {BRANDS.map(brand => (
                                <button 
                                    key={brand}
                                    className={`filter-pill-ks ${selectedBrand === brand ? 'active' : ''}`}
                                    onClick={() => setSelectedBrand(brand)}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group-ks">
                        <label>Category</label>
                        <div className="filter-options-ks">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat}
                                    className={`filter-pill-ks ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="v3-reset-btn-ks" onClick={clearFilters}>
                        Reset All Filters
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default Products;
